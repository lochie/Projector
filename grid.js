var grid = (function(){

	var grid = [];

	function init(gridFile,callback){
		if(gridFile){
			importGrid(gridFile, callback);
		}else{
			newGrid();
			callback();
		}
	}

	function newGrid(){
		console.log(">Creating default grid");
		var g = [];
		for(var i=0;i<main.map.x+1;i++){
			var m = [];
			for(var j=0;j<main.map.y+1;j++){
				var w = main.width/main.map.x;
				var h = main.height/main.map.y;
				m.push({x:i*w,y:j*h});
			}
			g.push(m);
		}
		grid = g;
		//exportGrid();
	}
	function importGrid(file,callback){
		console.log(">Uploading grid file: "+file);
		readTextFile(file,function(a){
			grid = JSON.parse(a);
			if(main.map.x != grid.length-1 || main.map.y != grid[0].length-1){
				console.log(">Your uploaded grid does not match the map settings of "+grid.length-1+"x"+grid[0].length-1);
				newGrid();
			}
			callback();
		});
	}
	function exportGrid(){
		console.log(">Exporting grid, check popup for blob file");
		createFile(JSON.stringify(grid, null, 4));
	}
	function getGrid(){
		return grid;
	}
	function setGrid(g){
		grid = g;
	}



	var isModifying = false;
	function modifyGrid(){
		if(isModifying){
			document.getElementById("modify").innerHTML = "Modify";
		}else{
			document.getElementById("modify").innerHTML = "Done";
			// somehow modify the grid???
		}
		isModifying = !isModifying;
	}





	function createFile(content) {
		var textFileAsBlob = new Blob([content], {type:'text/plain'});
		var downloadLink = document.createElement("a");
		window.URL = window.URL || window.webkitURL;
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.style.display = "none";
		downloadLink.setAttribute("target", "_blank");
		document.body.appendChild(downloadLink);
		downloadLink.click();
	}
	function readTextFile(file, callback){
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, false);
		rawFile.onreadystatechange = function(){
			if(rawFile.readyState === 4){
				if(rawFile.status === 200 || rawFile.status == 0){
					var allText = rawFile.responseText;
					callback(allText);
				}
			}
		}
		rawFile.send(null);
	}
	
	return {
		init:init,
		new: newGrid,
		
		export:exportGrid, // will replace current window
		import: importGrid,

		getGrid:getGrid,
		setGrid:setGrid,

		modify:modifyGrid,
		isModify:function(){ return isModifying },
	}


})();