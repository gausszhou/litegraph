var editorUseHtmlConsole = true; // enable html console to debug on mobile

// ToBarSelector
if (editorUseHtmlConsole) {
  document.getElementById("LGEditorTopBarSelector").innerHTML =
    "<button class='btn' id='btn_console'>Console</button> " +
    document.getElementById("LGEditorTopBarSelector").innerHTML;
}

// html console
if (editorUseHtmlConsole) {
  elem.querySelector("#btn_console").addEventListener("click", function () {
    var consoleCnt = document.getElementById("console-container");
    if (consoleCnt.classList.contains("invisible")) {
      consoleCnt.classList.remove("invisible");
    } else {
      jsConsole.clean();
      consoleCnt.classList.add("invisible");
    }
  });

  const params = {
    expandDepth: 1,
    common: {
      excludeProperties: ["__proto__"],
      removeProperties: ["__proto__"],
      maxFieldsInHead: 5,
      minFieldsToAutoexpand: 5,
      maxFieldsToAutoexpand: 15,
    },
  };
  // var jsConsole = new Console(document.querySelector('.console-container'), params);
  // jsConsole.log("Here is console.log!");

  // // map console log-debug to jsConsole
  // console.log = function(par){
  //     jsConsole.log(par);
  //     var objDiv = document.getElementById("console-container");
  //   objDiv.scrollTop = objDiv.scrollHeight;
  //   }
  //   console.debug = console.log;

  //   console.log("going into html console");

  //   document.getElementById("btn_console_clear").addEventListener("click", function(){
  //     var consoleCnt = document.getElementById('console-container');
  //     jsConsole.clean();
  //   });
  //   document.getElementById("btn_console_close").addEventListener("click", function(){
  //     var consoleCnt = document.getElementById('console-container');
  //     consoleCnt.classList.add("invisible");
  //   });
}
