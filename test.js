// create a script to scrape data from web page that loads more data on scroll
// and save it to a csv file

const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();

// autoscroller function

const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const results = [];

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
                
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                console.log("loaging more data")

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    const pagelink = "https://www.seedsman.com/eu_en/cannabis-seeds/flowering-type/regular-cannabis-seeds"
   
    await page.goto(pagelink);


    await autoScroll(page);


    const data = await page.evaluate(() => {
        const rate = '0.90909090909'

        console.log("starting")
        const category = "regular cannabis seeds"


        const images = document.querySelectorAll('.product-image-photo');

        // the price is in span tag with class price
        const prices = document.querySelectorAll('.price');

        // remove euro sign from price and convert to dollar
        const prices2 = Array.from(prices).map(price => price.innerText.replace('€', ''))

        // convert price to dollar using this formula (prices2/rate).toFixed(2)
        const prices3 = prices2.map(price => (price/rate).toFixed(2))


        // get the image link 
        const imageLinks = Array.from(images).map(v => v.src);
        // get the image alt text
        const imageAlt = Array.from(images).map(v => v.alt);

        // console.log(imageLinks, imageAlt);
        console.log("ths is the length of ",imageLinks.length);

        // make the object has a key of image and value of image link, and another key of description and value of alt text
        const imageObject = imageLinks.map((v, i) => ({image: v, description: imageAlt[i], price: prices3[i], category: category}));
        return imageObject;
    });

    // get the length of the data
    const length = data.length;
    console.log("this is the length of the data", length);
  // write and append to existing cs
  const csvWriter = createCsvWriter({
    path: 'regularcannabis.csv',
    header: [
      {id: 'image', title: 'image'},
      {id: 'description', title: 'description'}, 
      {id: 'category', title: 'category'},
        {id: 'price', title: 'price'}
    ]
  });

  csvWriter
    .writeRecords(data)
    .then(()=> console.log('The CSV file was written successfully'));

    await browser.close();

}

)();


