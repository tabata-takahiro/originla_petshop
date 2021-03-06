pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Holder.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Petshop is ERC721Token, ERC721Holder, Ownable{
    using SafeMath for uint256;
    uint dnaDigits = 16;
    uint dnaModulus = 10 ** dnaDigits;
    enum SoldFlg {DEFAULT, SOLD_OUT, EXHIBITION}
    struct Pet {
        // 遺伝子情報
        uint256 genes;
        // 名前
        string name;
        // 誕生日
        uint64 birthTime;
        // 売値
        uint256 price;
        // 売り物フラグ
        SoldFlg soldFlg;
    }
    Pet[] public pets;
    uint256 private constant price = 0.01 ether;
    constructor() ERC721Token("Pet", "DG") public {}

    modifier onlyOwnerOf(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender);
        _;
    }

    function mint() external onlyOwner {
        uint256 newPetId = _createPet(_generateRandomDna("PET RELEASE"));
        super._mint(msg.sender, newPetId);
    }

    // テスト用コード
    function test_mint() public {
        for (uint i = 0; i < 5; i++) {
            uint256 newPetId = _createPet(_generateRandomDna("PET TEST"));
            super._mint(msg.sender, newPetId);
        }
    }

    function buyPet(uint256 _petId) payable public {
        address seller = ownerOf(_petId);
        require(seller != address(0));
        require(seller != address(this));
        require(seller != msg.sender);
        require(msg.sender.balance >= msg.value);
        require(pets[_petId].price == msg.value);
        require(pets[_petId].soldFlg == SoldFlg.DEFAULT);

        pets[_petId].soldFlg = SoldFlg.SOLD_OUT;
        transferFrom(seller, msg.sender, _petId);
        seller.transfer(msg.value);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) {
        require(_from != address(0));
        require(_to != address(0));

        removeTokenFrom(_from, _tokenId);
        addTokenTo(_to, _tokenId);
        emit Transfer(_from, _to, _tokenId);
    }

    function _createPet(uint256 _genes) internal returns (uint) {
        Pet memory _pet = Pet({genes: _genes, name: "", birthTime: uint64(now), price: price, soldFlg: SoldFlg.DEFAULT});
        uint256 newPetId = pets.push(_pet) - 1;
        require(newPetId == uint256(uint32(newPetId)));

        return newPetId;
    }

    function _generateRandomDna(string _str) private view returns (uint) {
        uint rand = uint(keccak256(abi.encodePacked(_str, now)));
        return rand % dnaModulus;
    }

    function changeName(uint _petId, string _newName) external onlyOwnerOf(_petId) {
        pets[_petId].name = _newName;
    }

    function getPet(uint _petId) public view returns(uint256, string, uint64, uint256, SoldFlg) {
        Pet memory pet = pets[_petId];
        return (pet.genes, pet.name, pet.birthTime, pet.price, pet.soldFlg);
    }

    // 存在する全てのトークンID
    function getAllTokens() public view returns (uint256[]) {
        return allTokens;
    }

    // 自分の所持トークンID
    function getOwnTokens() public view returns(uint256[]) {
        return ownedTokens[msg.sender];
    }

    // ペットの価格再計算
    function calcPrice(uint256 _petId) public view returns (uint256 newPrice) {
        newPrice = pets[_petId].price.div(2);
    }

    // ペット出品
    function putPet(uint256 _petId) external onlyOwnerOf(_petId) {
        // 管理者のペットは不可
        require(ownerOf(_petId) != owner);
        // 売却フラグがSOLD_OUTのもののみ
        require(pets[_petId].soldFlg == SoldFlg.SOLD_OUT);
        pets[_petId].price = calcPrice(_petId);
        pets[_petId].soldFlg = SoldFlg.EXHIBITION;
    }

    function buyExhibitionPet(uint256 _petId) payable public {
        address seller = ownerOf(_petId);
        require(seller != address(0));
        require(seller != address(this));
        require(seller != msg.sender);
        require(msg.sender.balance >= msg.value);
        require(pets[_petId].price == msg.value);
        require(pets[_petId].soldFlg == SoldFlg.EXHIBITION);

        pets[_petId].soldFlg = SoldFlg.SOLD_OUT;
        transferFrom(seller, msg.sender, _petId);
        seller.transfer(msg.value);
    }
}
