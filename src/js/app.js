const address = "0xd8d3f512db8a64625529b60fc66c09893a6dc887"; // コントラクトのアドレス
let coinbase = null; // コントラクトを呼び出すアカウントのアドレス
let web3js;
let contract;
let tokens;
let isOwner = false; // コントラクトのオーナーかどうか
let isShop = false; // ショップページかどうか

// enum
const element = {
  // 遺伝子情報
  genes: 0,
  // 名前
  name: 1,
  // 誕生日
  birthTime: 2,
  // 売値
  price: 3,
  // 売り物フラグ
  soldFlg: 4
};

$.getJSON("Petshop.json", function(data) {
  if (typeof web3 !== "undefined") {
    web3js = new Web3(web3.currentProvider);
  } else {
    web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  }
  web3js.eth.getAccounts(function(err, accounts) {
    if (err) return;
    coinbase = accounts[0];
    if (typeof coinbase !== "undefined") {
      console.log(coinbase);
    } else {
      console.log("Please login.");
    }
  });
  contract = web3js.eth.contract(data.abi).at(address);
  contract.owner.call(function(err, result) {
    isOwner = result == coinbase;
    console.log(`isowner : ${isOwner} result : ${result}`);
    if (!isOwner) $("#mint").attr("disabled", true);
  });
});

// ペットショップ初期化
function init() {
  window.alert("ここはペットショップです");
  isShop = true;

  // ショップのペット取得
  contract.getAllTokens.call(function(err, res) {
    if (!err) {
      getAllPet(res, "販売中ペット一覧");
    } else {
      console.log(err);
    }
  });
}

// マイペット初期化
function myPetInit() {
  window.alert("購入済みのペット一覧です");
  isShop = false;

  // 購入済みのペット取得
  contract.getOwnTokens.call(function(err, res) {
    if (!err) {
      getAllPet(res, "購入済みペット一覧");
    } else {
      console.log(err);
    }
  });
}

// ショップor購入者のペットを全て取得
function getAllPet(res, title) {
  let petsRow = $("#petsRow");
  let petTemplate = $("#petTemplate");
  tokens = res;

  if (tokens.length <= 0) {
    window.alert("ペットがいません");
  }
  $("#section-title").text(title);
  petsRow.empty();
  for (let i = 0; i < tokens.length; i++) {
    let token_id = tokens[i];
    contract.getPet(token_id, function(error, result) {
      let pet = result;
      let day = new Date(pet[element.birthTime] * 1000);
      let age = elapsedDays(day);
      let price = web3js.fromWei(pet[element.price], "ether");

      petTemplate.find(".pet-id").text(`No : ${Number(token_id) + 1}`);
      petTemplate.find(".pet-name").text(`${pet[element.name]}`);
      petTemplate.find("img").attr("src", `images/${getBreedKey(pet[element.genes])}.jpeg`);
      petTemplate.find(".pet-breed").text(getBreed(getBreedKey(pet[element.genes])));
      petTemplate.find(".pet-age").text(age);
      petTemplate.find(".pet-location").text(getPrefecture(pet[element.genes]));
      petTemplate.find(".pet-price").text(price);
      petTemplate.find(".btn-adopt").attr("id", token_id);
      petTemplate.find(".btn-adopt").attr("data-price", pet[element.price]);
      petTemplate.find(".pet-sold").text(pet[element.soldFlg]);
      petTemplate.find(".name-adopt").attr("id", token_id);
      contract.ownerOf.call(token_id, function(err, result) {
        if (!err) console.log(result);
        else console.log("err:" + err);
        petTemplate.find(".pet-owner").text(result);
      });

      if(isShop) {
        if(pet[element.soldFlg] > 0) {
          switchDisplay(petTemplate, true);
        } else {
          switchDisplay(petTemplate, false);
        }
        if(isOwner) {
          petTemplate.find(".btn-adopt").attr("disabled", true);
          petTemplate.find(".name-adopt").attr("disabled", true);
        } else {
          petTemplate.find(".name-adopt").attr("disabled", true);
        }
      } else {
        petTemplate.find(".btn-adopt").attr("disabled", true);
        if(pet[element.soldFlg] > 0) {
          switchDisplay(petTemplate, false);
        } else {
          switchDisplay(petTemplate, true);
        }
        if(!isOwner) petTemplate.find(".name-adopt").attr("disabled", false);
      }

      if(isOwner) {
        petTemplate.find(".btn-adopt").attr("disabled", true);
        petTemplate.find(".name-adopt").attr("disabled", true);
      }
      petsRow.append(petTemplate.html());
    });
  }
}

// 購入状態で表示切り替え
function switchDisplay(petTemplate, isSold) {
  let display = "";
  if(isSold) display = "none";
  petTemplate.find(".panel-body").attr("style", `display: ${display};`);
}

// ペット生成(オーナーのみ)
function mint() {
  contract.mint.sendTransaction({ from: coinbase, gas: 3000000 }, function(
    err,
    result
  ) {
    if (!err) console.log(result);
    else console.log("err:" + err);
    init();
  });
}

// 都道府県コード
const pref = {
  "01": "北海道",
  "02": "青森県",
  "03": "岩手県",
  "04": "宮城県",
  "05": "秋田県",
  "06": "山形県",
  "07": "福島県",
  "08": "茨城県",
  "09": "栃木県",
  "10": "群馬県",
  "11": "埼玉県",
  "12": "千葉県",
  "13": "東京都",
  "14": "神奈川県",
  "15": "新潟県",
  "16": "富山県",
  "17": "石川県",
  "18": "福井県",
  "19": "山梨県",
  "20": "長野県",
  "21": "岐阜県",
  "22": "静岡県",
  "23": "愛知県",
  "24": "三重県",
  "25": "滋賀県",
  "26": "京都府",
  "27": "大阪府",
  "28": "兵庫県",
  "29": "奈良県",
  "30": "和歌山県",
  "31": "鳥取県",
  "32": "島根県",
  "33": "岡山県",
  "34": "広島県",
  "35": "山口県",
  "36": "徳島県",
  "37": "香川県",
  "38": "愛媛県",
  "39": "高知県",
  "40": "福岡県",
  "41": "佐賀県",
  "42": "長崎県",
  "43": "熊本県",
  "44": "大分県",
  "45": "宮崎県",
  "46": "鹿児島県",
  "47": "沖縄県"
};

const breed = {
  "0": "Scottish Terrier",
  "1": "French Bulldog",
  "2": "Boxer",
  "3": "Golden Retriever"
};

/**
 * DNAから出身地を返す
 * @param {number} dna - DNA
 * @returns {string} - 出身地
 */
function getPrefecture(dna) {
  let prefecture_id = (String(dna).substring(2, 3) % 47) + 1;
  return pref[String(prefecture_id).padStart(2, "0")];
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
  return breed[breedKey];
}

// ペット購入
function buyPet(selectObj) {
  let petId = selectObj.id;
  let price = selectObj.getAttribute("data-price");
  console.log(`${petId}のペットを購入 値段 : ${price} eth`);
  contract.buyPet.sendTransaction(
    petId,
    { value: price, gas: 3000000 },
    function(err, result) {
      if (!err) console.log(result);
      myPetInit();
    }
  );
}

function putPet(selectObj) {
  let petId = selectObj.id;
  contract.putPet.sendTransaction(petId, function(err, result) {
    if (!err) console.log(result);
    else console.log("err:" + err);
    init();
  });
}

function getId(selectObj) {
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

// 入力された名前を取得する
function setName(selectObj ,name) {
  let petId = selectObj.id;
  let inputName = document.getElementById(name).value;
  alert(`${petId}の名前は${inputName}です`);
  contract.changeName.sendTransaction(petId, inputName, function(err, result) {
    if (!err) console.log(result);
    myPetInit();
  });
}
