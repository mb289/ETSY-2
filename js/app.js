window.onload = app;  // does not matter if this is on top or bottom.

// runs when the DOM is loaded

function app() {   //It loads rest of JS file  

    // load some scripts (uses promises :D)
    loader.load({
        url: "./bower_components/jquery/dist/jquery.min.js"
    }, {
        url: "./bower_components/lodash/dist/lodash.min.js"
    }, {
        url: "./bower_components/pathjs/path.min.js"
    }).then(function() {
        _.templateSettings.interpolate = /{([\s\S]+?)}/g;   // template for lodash

        var options = {
                api_key: "9pd4mhlgcqva2kfk9bd4i1vd"
            }
            // start app?
        var client = new EtsyClient(options);    
    })

}

function EtsyClient(options) { //constructor function that tests if e give it a API key
    if (!options.api_key) {
        throw new Error("Yo dawg, I heard you like APIs. Y U NO APIKEY!?!?");
    }
    this.etsy_url = "https://openapi.etsy.com/";
    this.version = options.api_version || "v2/"; // handle api version... if not given, just use the default "v2"
    this.api_key = options.api_key;
    this.complete_api_url = this.etsy_url + this.version;

    // derp.
    this.init();       //constructor function that tests if e give it a API key
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

EtsyClient.prototype.drawSingleListing = function(id) { //filtering all results 
    var listing = this.latestData.results.filter(function(listing) { // runs it 24 times until it finds the ID.
        return listing.listing_id === parseInt(id);  //returns the data object not just listing.
    });

    var grid = document.querySelector("#listings");

    var bigHtmlString = _.template(this.singleListingHtml, listing[0]);

    grid.innerHTML = bigHtmlString;
}

EtsyClient.prototype.setupRouting = function() {
    var self = this;

    Path.map("#/").to(function() {   // grab the loading listing html and data. Inside this call back function we are not in EtsyClient. To access we use instance which is why we use self.
        self.drawListings(self.listingHtml, self.latestData);
    });

    Path.map("#/message/:anymessage").to(function() {
        alert(this.params.anymessage);
    })

    Path.map("#/listing/:id").to(function() {  //
        self.drawSingleListing(this.params.id);
    });

    // set the default hash
    Path.root("#/");  //if there is no hash on url, it will set the default route to be #/
}

EtsyClient.prototype.init = function() {
    var self = this;   //stores a reference to the instance
    this.setupRouting();  // routing

    $.when(                         //(the "listing" or "single-page-listing" we are involinkg the data)
        this.pullAllActiveListings(), //this returns a promise.  getting results and storing property on the instance.  (into self. )
        this.loadTemplate("listing"),
        this.loadTemplate("single-page-listing")
    ).then(function(data, html, singlePageHtml) {  //whatever is passed in here is in order from the top.

        //Create three properties on our Etsy instance
        self.latestData = data;
        self.listingHtml = html;
        self.singleListingHtml = singlePageHtml;


        Path.listen();
    })
}
