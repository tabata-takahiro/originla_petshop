const address = "0x2ee3c9f2ead1e2d4174cfa8863dacfe3a11309d0" // コントラクトのアドレス
let coinbase = null; // コントラクトを呼び出すアカウントのアドレス
let web3js;
let contract;
let tokens;
let price;

// 初期化
function init() {
    let petsRow = $('#petsRow');
    let petTemplate = $('#petTemplate');

  $.getJSON('Petshop.json', function(data) {
    if (typeof web3 !== 'undefined') {
      web3js = new Web3(web3.currentProvider);
    } else {
      web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    }
    web3js.eth.getAccounts(function(error, accounts) {
      if (error) return;
      coinbase = accounts[0];
      if (typeof coinbase !== 'undefined') {
        console.log(coinbase);
      } else {
        console.log('Please login.');
      }
    });

    contract = web3js.eth.contract(data.abi).at(address);
    contract.getAllTokens.call(function(err, res) {
      tokens = res;
      if(tokens.length <= 0) {
        window.alert("ペットがいません");
      }
      for(let i = 0; i < tokens.length; i++) {
        let token_id = tokens[i];
        contract.getPet(token_id, function(error, result) {
          let pet = result;
          let d = new Date(pet[2] * 1000);
          let age = elapsedDays(d);
          price = web3js.fromWei(pet[3], 'ether');
          petTemplate.find(`.pet-id`).text(`No : ${Number(token_id) + 1}`);
          petTemplate.find('.panel-title').text(`${pet[1]}`);
          petTemplate.find('img').attr('src', `images/${getBreedKey(pet[0])}.jpeg`);
          petTemplate.find('.pet-breed').text(getBreed(getBreedKey(pet[0])));
          petTemplate.find('.pet-age').text(age);
          petTemplate.find('.pet-location').text(getPrefecture(pet[0]));
          petTemplate.find('.pet-price').text(price);
          petTemplate.find('.btn-adopt').attr('id', token_id);
          petTemplate.find('.btn-adopt').attr('data-price', pet[3]);
          petsRow.append(petTemplate.html());
        })
      }
    })

  });
}

// すべてのペット確認
function popUpAllPet() {
  $.getJSON('Petshop.json', function(data) {
    contract = web3js.eth.contract(data.abi).at(address);
    for(var i = 0; i < tokens.length; i++) {
      pet = contract.getPet(i ,function(err,result){
        window.alert(`ID : ${i} 出身 : ${getPrefecture(result[0])} 犬種 : ${getBreedKey(result[0])}`);
      })
    }
  });
}

// ペット生成(オーナーのみ)
function mint() {
  contract.mint.sendTransaction({from:coinbase, gas:3000000}, function(err, result){
    if (!err)
      console.log(result);
    else
      console.log('err:' + err);
    window.location.reload();
  });
}

// 都道府県コード
const pref={
  '01':'北海道',
  '02':'青森県',
  '03':'岩手県',
  '04':'宮城県',
  '05':'秋田県',
  '06':'山形県',
  '07':'福島県',
  '08':'茨城県',
  '09':'栃木県',
  '10':'群馬県',
  '11':'埼玉県',
  '12':'千葉県',
  '13':'東京都',
  '14':'神奈川県',
  '15':'新潟県',
  '16':'富山県',
  '17':'石川県',
  '18':'福井県',
  '19':'山梨県',
  '20':'長野県',
  '21':'岐阜県',
  '22':'静岡県',
  '23':'愛知県',
  '24':'三重県',
  '25':'滋賀県',
  '26':'京都府',
  '27':'大阪府',
  '28':'兵庫県',
  '29':'奈良県',
  '30':'和歌山県',
  '31':'鳥取県',
  '32':'島根県',
  '33':'岡山県',
  '34':'広島県',
  '35':'山口県',
  '36':'徳島県',
  '37':'香川県',
  '38':'愛媛県',
  '39':'高知県',
  '40':'福岡県',
  '41':'佐賀県',
  '42':'長崎県',
  '43':'熊本県',
  '44':'大分県',
  '45':'宮崎県',
  '46':'鹿児島県',
  '47':'沖縄県'
};

const breed = {
  '0':'Scottish Terrier',
  '1':'French Bulldog',
  '2':'Boxer',
  '3':'Golden Retriever'
};

/**
* DNAから出身地を返す
* @param {number} dna - DNA
* @returns {string} - 出身地
*/
function getPrefecture(dna) {
  let prefecture_id = String(dna).substring(2, 3)% 47 + 1;
  return pref[String(prefecture_id).padStart(2, '0')];
}

/**
* DNAから犬種キーを返す
* @param {number} dna - DNA
* @returns {number} - 犬種キー
*/
function getBreedKey(dna) {
  return String(dna).substring(0, 1) % 4;
}

// 犬種キーを元に犬種を返す
function getBreed(breedKey) {
  return breed[breedKey]
}

// ペット購入
function buyPet(selectObj) {
  let price = selectObj.getAttribute('data-price');
  console.log(`${petId}のペットを購入 値段 : ${price} eth`);
  contract.buyPet.sendTransaction(petId, {value: web3js.toWei(price, "ether"), gas:3000000}, 
  function(err, result) {
    if (!err) console.log(result);
  });
}

function getId(selectObj){
  const petId = selectObj.id; // ペットidを取得
  console.log(petId); //「id01」
}

/**
 * 経過日数を返す
 * @param {Date} date - 日時
 * @returns {Number} - 日数
 */
function elapsedDays(date) {
  let now = new Date();
  let diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}