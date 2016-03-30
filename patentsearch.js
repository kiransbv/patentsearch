// PATENT SEARCH SCRIPT __ documentation available at http://www.kiran.beer/triz-patent-search-tool.html

// This script searches Google Patents for the number of US patents published per year for a given search term

// Note: PhantomJS and CasperJS must be installed and added to the Path

// Edit the variables on lines 30, 31 and 32 for your particular search

// To run this script, in the command line change to the current directory and inout the following command: casperjs patentsearch.js

// Initialisation that hooks into PhantomJS
phantom.casperPath = "/casperjs";
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');

// Import unitls module that allows for many more functions
var utils = require('utils');

// Fire up Casper variable - does all the magic!
var casper = require('casper').create();

// Setup variable for X Path
var x = require('casper').selectXPath;


// Set user browser data
casper.userAgent('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)');

// Set variables for search
// EDIT THESE FOR YOUR SEARCH
var searchTerm = "iphone"; // Use "+" to separate terms
var firstYear = 2000;
var lastYear = 2015;
var pageLoadTime = 3000; // Time spent waiting for each page to load in ms (recommended: 3000 - 5000 ms)
console.log('Input parameters set');
console.log('Search term: '+searchTerm);
console.log('From: '+firstYear);
console.log('To: '+lastYear);


// Error handling
casper.on('error', function(msg,backtrace) {
    this.echo("=========================");
    this.echo("ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
});
casper.on("page.error", function(msg, backtrace) {
    this.echo("=========================");
    this.echo("PAGE.ERROR:");
    this.echo(msg);
    this.echo(backtrace);
    this.echo("=========================");
});



// Open Google Patents and display title
casper.start('https://patents.google.com/');
casper.wait(pageLoadTime, function(){
    this.echo(this.getTitle()); // setup test "Google Patents" should appear
    casper.capture("homepage.png");
    console.log('Homepage accessed');

    var numberOfSearches = lastYear - firstYear + 1;
    var years = new Array(numberOfSearches);
    years[0] = lastYear;
    var URLs = new Array(numberOfSearches);
    var results = new Array(numberOfSearches);
    function createArray(length) {
        var arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments, 1);
            while(i--) arr[length-1 - i] = createArray.apply(this, args);
        }

        return arr;
    }
    var myData = createArray(numberOfSearches,2);
    // console.log(myData);
    console.log('Arrays initialised');

    casper.then(function(){
        var current = 1;

        for (;current <= numberOfSearches;) {

            (function (cntr) {
                // console.log('Step ' + cntr + ' of ' + numberOfSearches + ' started');
                if (cntr > 1) {
                    years[cntr-1] = years[cntr - 2] - 1;
                }
                URLs[cntr-1] = "https://patents.google.com/?q=" + searchTerm + "&country=US&before=publication:" + years[cntr-1] + "1231&after=publication:" + years[cntr-1] + "0101";
                // console.log('Year and URL set')
                // console.log(years);
                casper.thenOpen(URLs[cntr-1], function () {
                    // console.log('Accessing new page')
                    // here we can download stuff
                    casper.wait(pageLoadTime, function() {
                        results[cntr - 1] = casper.fetchText(x('//*[@id="resultsContainer"]/div/div[1]/span[3]'));
                        results[cntr - 1] = parseFloat(results[cntr - 1].replace(/,/g, '')); // removes commas from number of results
                        console.log(years[cntr - 1] + " = " + results[cntr - 1]);
                        casper.then(function (){
                            var myfile = searchTerm+"_patents_"+ firstYear + "-" + lastYear + ".csv";

                            myData[cntr - 1][0] = "\n" + years[cntr - 1];
                            myData[cntr - 1][1] = results[cntr - 1];
                            // console.log(myData);
                            var fs = require('fs');
                            fs.write(myfile, "Year,Patents,"+myData, 'w');
                        });
                    });
                });
                // console.log('Step ' + cntr + ' of ' + numberOfSearches + ' completed');
            })(current);

            current++;
        }
    });

});

casper.then(function (){

    console.log("Done");
    casper.exit();
});

casper.run();

/**
 * Created by Kiran Beersing-Vasquez on 29-Mar-16.
 */