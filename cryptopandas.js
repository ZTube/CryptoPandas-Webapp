const cryptoPandasAddress = "0xf91f0ab473a92661204fa34f8f1c748e0a8fc011";
var cryptoPandasContract;
var cryptoPandas;

var selection = [];
var mode = "";

document.addEventListener('DOMContentLoaded', function() {
	const logged_out = document.getElementsByClassName("logged-out")[0];
	const logged_in = document.getElementsByClassName("logged-in")[0];
	const card_wrapper = document.getElementsByClassName("card-wrapper")[0];


	if (typeof web3 !== 'undefined' && web3.currentProvider.enable() !== undefined && web3.currentProvider.selectedAddress !== undefined) {
		console.log("MetaMask found");
		logged_in.style.display = "block";

		console.log(ethereum.networkVersion);

		web3js = new Web3(web3.currentProvider);

		const account = document.getElementById("account");
		account.innerHTML = account.innerHTML + web3js.eth.defaultAccount;

		cryptoPandasContract = web3js.eth.contract(cryptoPandasABI);
		cryptoPandas = cryptoPandasContract.at(cryptoPandasAddress);

		/*cryptoPandas.getPandasOfOwner(web3js.eth.defaultAccount, function(error, result){
			console.log(JSON.stringify(result));
				
			for(var panda in result) {
				cryptoPandas.pandas(panda, function(error, result){
					displayPanda(card_wrapper, panda, result[0], result[1].toString(16));
				});
				}
		});*/

		var pandaCreated = cryptoPandas.PandaCreated({ owner: web3js.eth.defaultAccount}, {fromBlock: 0, toBlock: 'latest'});
		pandaCreated.watch(function(error, result){
			if (!error){
				displayPanda(card_wrapper, result.args.id, result.args.name, result.args.gen, result.args.dna.toString(16));
			}
			else {
				console.log(error);
			}
		});

	}
	else {
		console.log("No MetaMask found");
		logged_out.style.display = "block";
	}
})

function displayPanda(card_wrapper, id, pandaName, generation, dna) {
	console.log(pandaName + ":	" + dna);

	var card = '<div class="card" id="panda-' + id + '" ' + 'onclick="selectPanda(' + id + ')">\n';

	var background = getDnaAttrib(dna, 0, 1);
	var body = getDnaAttrib(dna, 1, 1);
	var face = getDnaAttrib(dna, 2, 1);
	var eyes = getDnaAttrib(dna, 3, 1);
	var accessoires = getDnaAttrib(dna, 4, 2)
	var rarity = getDnaAttrib(dna, 7, 1);

	card += getBackground(background);
	card += getBody(body);
	card += getFace(face);
	card += getEyes(eyes);
	card += getAccessoires(accessoires);
	card += getRarity(rarity);

	card += '<p class="name">' + pandaName + '</p>\n';
	card += '<p class="gen">' + generation + '</p>\n';
	card += '<div class="selected"></div>\n';
	card += '<div class="hovered"></div>\n';
	
	card += '</div>\n';
	
	card_wrapper.innerHTML += card;
}

function getBackground(attrib){
	return '';
}

function getBody(attrib){
	return '<img class="panda" src="images/panda.png">\n';
}

function getFace(attrib){
	return '';
}

function getEyes(attrib){
	return '';
}

function getAccessoires(attrib){
	return '';
}

function getRarity(attrib){
	switch (attrib) {
		case 0xf:
			return '<img class="frame" src="images/frames/frame_legendary.png">\n';
		default:
			return '<img class="frame" src="images/frames/frame.png">\n';

	}
}

function getDnaAttrib(dna, part, length) {
	attrib = dna.substr(dna.length - part - length, length);
	return parseInt(attrib, 16);
}

function changeMode(mode) {
	var btnMining = document.getElementById("mode-mining");
	var btnBreeding = document.getElementById("mode-breeding");

	var sectionMining = document.getElementsByClassName("mining-wrapper")[0];
	var sectionBreeding = document.getElementsByClassName("breeding-wrapper")[0];

	btnMining.classList = [];
	btnBreeding.classList = [];
	sectionMining.style.display = "";
	sectionBreeding.style.display = "";

	switch(mode){
		case "mining":
			btnMining.classList.add("active");
			sectionMining.style.display = "block";
			break;
		case "breeding":
			btnBreeding.classList.add("active");
			sectionBreeding.style.display = "block";
			break;
	}

	this.mode = mode;
}

function selectPanda(id) {
	var card = document.getElementById("panda-" + id);
	var selected = card.getElementsByClassName("selected")[0];

	var selectionCount = 0;
	if(mode == "breeding")
		selectionCount = 2;

	var index = selection.indexOf(id);

	if(selectionCount > selection.length && index < 0){
		selection.push(id);
		selected.style.display = "block";
	}
	else if(index >= 0){
  		selection.splice(index, 1);
		selected.style.display = "none";
	}

}

function minePanda() {
	var pandaName = document.getElementById("minePandaName").value;
	var nonce = document.getElementById("minePandaNonce").value;
	var button = document.getElementById("minePandaButton");
	
	if(pandaName && !isNaN(nonce)){
		button.classList.add("pending");
		cryptoPandas.minePanda(pandaName, nonce, function(error, result)
		{
			button.classList.remove("pending");
			if(!error){
				button.classList.add("success");
				button.addEventListener("transitionend", function() {button.classList.remove("success");}, false);
			}
			else {
				console.error(error);
				button.classList.add("failure");
				button.addEventListener("transitionend", function() {button.classList.remove("failure");}, false);
			}

		});
	}
	else {
		console.error("Insufficient arguments");
		button.classList.add("failure");
		button.addEventListener("transitionend", function() {button.classList.remove("failure");}, false);
	}
}

function breedPandas(){
	var pandaName = document.getElementById("breedPandaName").value;
	var button = document.getElementById("breedPandaButton");

	if(pandaName && selection.length == 2){
		button.classList.add("pending");
		cryptoPandas.breedPandas(pandaName, selection[0], selection[1], function(error, result){
			button.classList.remove("pending");
			if(!error){
				button.classList.add("success");
				button.addEventListener("transitionend", function() {button.classList.remove("success");}, false);
			}
			else{
				console.error(error);
				button.classList.add("failure");
				button.addEventListener("transitionend", function() {button.classList.remove("failure");}, false);
			}
		});
	}
	else {
		console.error("Inappropriate number of Pandas selected or invalid name");
		button.classList.add("failure");
		button.addEventListener("transitionend", function() {button.classList.remove("failure");}, false);
	}
}
