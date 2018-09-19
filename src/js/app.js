const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const address = "0x0a54ca767f704520e20a3f8b137f4ad035651c78"
const coinbase = web3.eth.accounts[0];

// 初期化
function init() {
  var petsRow = $('#petsRow');
  var petTemplate = $('#petTemplate');
  $.getJSON('Petshop.json', function(data) {
    contract = web3.eth.contract(data.abi).at(address);
    console.log("contract : ", contract);
    let name = contract.name.call();
    tokens = contract.getAllTokens();
    
    for(var i = 0; i < tokens.length; i++) {
      pet = contract.getPet(i);
      console.log(`Pet : ${pet}`);
      
      petTemplate.find('.panel-title').text(pet);
      //petTemplate.find('img').attr('src', pet);
      petTemplate.find('.pet-breed').text("柴犬");
      //petTemplate.find('.pet-age').text(pet);
      petTemplate.find('.pet-location').text("日本");
      //petTemplate.find('.btn-adopt').attr('data-id', pet);
      petsRow.append(petTemplate.html());
    }
  });
}

// ペット生成(オーナーのみ)
function mint() {
  var owner;
  console.log("coinbase : ", coinbase);
  $.getJSON('Petshop.json', function(data) {
    owner = web3.eth.contract(data.abi).at(coinbase);
    console.log("owner : ",owner);
    owner.mint();
  });
}