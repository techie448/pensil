// const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');
const getText = async (page, selector) => {
    const element = await page.$(selector);
    const text = await page.evaluate(element => element.innerText, element);
    return text;
}
const extractData = (table) => {
    const result = {}
    let tableArr = table.split('\n');
    tableArr.shift();
    tableArr.forEach(el => {
        let [name, value] = el.split('\t')
        name = name.trim();
        value = value.trim().replace(' ','');
        result[name] = value
    });
    return result;
}
module.exports  = async (req, res) => {

    try{
        // const {address, city, zip} = req.body;
        const url = `https://munstats.pa.gov/Public/FindLocalTax.aspx`;
        const browser = await puppeteer.launch({headless: true});
        // const browser = await chromium.puppeteer.launch({
        //     args: chromium.args,
        //     defaultViewport: chromium.defaultViewport,
        //     executablePath: await chromium.executablePath,
        //     headless: chromium.headless,
        // });
        console.log('broweser layng')
        const page = await browser.newPage();
        console.log('page')
        await page.goto(url, {waitUntil: 'load'});
        console.log('url')
        await page.type('#ContentPlaceHolder1_txtHomeStreet', '3805 Forbes Ave');
        await page.type('#ContentPlaceHolder1_txtHomeCity', 'Oakland');
        await page.type('#ContentPlaceHolder1_txtHomeZip', '15213');
        await page.click('#ContentPlaceHolder1_lbCopyFromHome');
        await page.click('#ContentPlaceHolder1_btnViewInformation');
        console.log('click')
        await page.waitForSelector('#ContentPlaceHolder1_lblHomePSD');
        const PSD = await getText(page, '#ContentPlaceHolder1_lblHomePSD');
        let table = await getText(page, '#ContentPlaceHolder1_tblResults > tbody > tr:nth-child(3) > td > table:nth-child(1) > tbody > tr:nth-child(11) > td > table')
        let loc = await getText(page, '#ContentPlaceHolder1_lblWorkSchoolDistrictName')
        const tableData = extractData(table)
        console.log({PSD, tableData, loc})
        res.status(200).json({PSD, ...tableData, loc});
    }
catch(err){
        res.status(500).json({err})
}
    return res;
}