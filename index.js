const { Firestore } = require('@google-cloud/firestore');
const { Builder, By, until, Key } = require('selenium-webdriver');

require('chromedriver');

// Configurando o Firestore
const firestore = new Firestore({
  projectId: 'dozero-9ea70',
  keyFilename: 'autentication.json'
});

// Obter todos os produtos do Firestore
async function getAllProductsFromFirestore() {
    const productsRef = firestore.collection('teste2');
    const snapshot = await productsRef.get();
    const products = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        nome: data.nome,
        preco: data.preco
       
      });
    });
  
    return products;
  }
  

// Usar o Selenium para digitar o nome do produto nas Lojas Americanas
async function searchProductOnAmericanas(produtos) {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get("https://www.amazon.com.br/")
    await driver.sleep(3000)
    console.log("É o preço do banco de dados: "+ produtos.preco)
    const inputPesquisa = await driver.wait(until.elementLocated(By.xpath('//*[@id="twotabsearchtextbox"]')), 10000);
    // faz a pesquisa e clica enter
    await inputPesquisa.sendKeys(produtos.nome, Key.ENTER)
    await driver.wait(until.elementLocated(By.xpath('//*[@id="search"]/div[1]/div[1]/div/span[1]/div[1]/div[4]/div/div/div/div/div/div/div[1]/span/a')), 10000).click()
    const precoDaPlaca = await driver.wait(until.elementLocated(By.xpath('//*[@id="corePriceDisplay_desktop_feature_div"]/div[1]/span[1]/span[2]/span[2]')), 10000).getText()
    await driver.sleep(2000)
    console.log("É o preço da placa: "+precoDaPlaca)
    if(precoDaPlaca < produtos.preco){
    // Clica no produto

    // Clica no carrinho de compras
    console.log("achou um de menor preço")
    //adcionar ao carrinho
    await driver.wait(until.elementLocated(By.xpath('//*[@id="add-to-cart-button"]')), 10000).click()
    await driver.sleep(1000);
    
      // input do carrinho: //*[@id="add-to-cart-button"]   
    }
  } finally {
    await driver.quit();
  }
}
(async () => {
  const products = await getAllProductsFromFirestore();
  if (products && products.length > 0) {
    for (const product of products) {
      await searchProductOnAmericanas(product);
    }
  } else {
    console.log('Não foram encontrados produtos no Firestore.');
  }
})()
