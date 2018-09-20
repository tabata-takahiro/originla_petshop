const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const address = "0x69fe515c228dc637cb2a044e21e3ddef52a4dbc1" // コントラクトのアドレス
const coinbase = web3.eth.accounts[0]; // コントラクトを呼び出すアカウントのアドレス
var contract;

// 初期化
function init() {
  var petsRow = $('#petsRow');
  var petTemplate = $('#petTemplate');
  $.getJSON('Petshop.json', function(data) {
    contract = web3.eth.contract(data.abi).at(address);

    console.log("contract : ", contract);
    console.log("coinbase : ", coinbase);

    let name = contract.name.call();
    tokens = contract.getAllTokens();
    for(var i = 0; i < tokens.length; i++) {
      pet = contract.getPet(i);
      window.alert(`トークン一覧\n${pet}`);

      // 出身
      getPrefecture(pet[0]);

      // 犬種
      getBreedKey(pet[0]);

      console.log(`ID : ${i} 出身 : ${getPrefecture(pet[0])} 犬種 : ${getBreedKey(pet[0])}`);

      // petの要素数１つ目が遺伝子情報
      petTemplate.find('.panel-title').text(`名前 : ${pet[0]}ちゃん`);
      petTemplate.find('img').attr('src', `images/${getBreedKey(pet[0])}.jpeg`);
      petTemplate.find('.pet-breed').text(getBreed(getBreedKey(pet[0])));
      petTemplate.find('.pet-age').text(pet[2]);
      petTemplate.find('.pet-location').text(getPrefecture(pet[0]));
      petTemplate.find('.btn-adopt').attr('id', i);
      petsRow.append(petTemplate.html());
    }
  });
}

// ペット生成(オーナーのみ)
function mint() {
  contract.mint();
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
}

const breed = {
  '0':'Scottish Terrier',
  '1':'French Bulldog',
  '2':'Boxer',
  '3':'Golden Retriever'
}
/**
* DNAから出身地を返す
* @param {number} dna - DNA
* @returns {string} - 出身地
*/
function getPrefecture(dna) {
  let prefecture_id = String(dna).substring(2, 3)% 47 + 1
  return pref[String(prefecture_id).padStart(2, '0')]
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
  const petId = selectObj.id; // eleのプロパティとしてidを取得
  //contract.buyPet(petId);
  console.log(`${petId}のペットを購入`);
}

function getId(selectObj){
  const petId = selectObj.id; // eleのプロパティとしてidを取得
  console.log(petId); //「id01」
}