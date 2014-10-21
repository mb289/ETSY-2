window.onload = app;

// runs when the DOM is loaded

function app() {

    // load some scripts (uses promises :D)
    loader.load({
        url: "./bower_components/jquery/dist/jquery.min.js"
    }, {
        url: "./bower_components/lodash/dist/lodash.min.js"
    }, {
        url: "./bower_components/pathjs/path.min.js"
    }).then(function() {
        _.templateSettings.interpolate = /{([\s\S]+?)}/g;

        var options = {
                api_key: "aavnvygu0h5r52qes74x9zvo"
            }
            // start app?
        var client = new EtsyClient(options);
    })

}

function EtsyClient(options) {
    if (!options.api_key) {
        throw new Error("Yo dawg, I heard you like APIs. Y U NO APIKEY!?!?");
    }
    this.etsy_url = "https://openapi.etsy.com/";
    this.version = options.api_version || "v2/"; // handle api version... if not given, just use the default "v2"
    this.api_key = options.api_key;
    this.complete_api_url = this.etsy_url + this.version;

    // derp.
    this.init();
}

EtsyClient.prototype.pullAllActiveListings = function() {
    return $.getJSON(
            this.complete_api_url + "listings/active.js?api_key=" + this.api_key + "&includes=Images&callback=?"
        )
        .then(function(data) {
            return data;
        });
}

EtsyClient.prototype.loadTemplate = function(name) {
    return $.get("./templates/" + name + ".html").then(function() {
        return arguments[0];
    })
}

EtsyClient.prototype.drawListings = function(templateString, data) {
    var grid = document.querySelector("#listings");

    var bigHtmlString = data.results.map(function(listing) {
        return _.template(templateString, listing);
    }).join('');

    grid.innerHTML = bigHtmlString;
}

EtsyClient.prototype.drawSingleListing = function(id) {
    var listing = this.latestData.results.filter(function(listing) {
        return listing.listing_id === parseInt(id);
    });

    var grid = document.querySelector("#listings");

    var bigHtmlString = _.template(this.singleListingHtml, listing[0]);

    grid.innerHTML = bigHtmlString;
}

EtsyClient.prototype.setupRouting = function() {
    var self = this;

    Path.map("#/").to(function() {
        self.drawListings(self.listingHtml, self.latestData);
    });

    Path.map("#/message/:anymessage").to(function() {
        alert(this.params.anymessage);
    })

    Path.map("#/listing/:id").to(function() {
        self.drawSingleListing(this.params.id);
    });

    // set the default hash
    Path.root("#/");
}

EtsyClient.prototype.init = function() {
    var self = this;
    this.setupRouting();

    $.when(
        this.pullAllActiveListings(),
        this.loadTemplate("listing"),
        this.loadTemplate("single-page-listing")
    ).then(function(data, html, singlePageHtml) {

        self.latestData = data;
        self.listingHtml = html;
        self.singleListingHtml = singlePageHtml;

        Path.listen();
    })
}
