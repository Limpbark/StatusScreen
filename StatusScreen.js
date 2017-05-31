//version 1.3.0
//I  have commented more or less everything so that anyone can easily make changes and/or learn! This really helped me when I started, I hope it helps you too! :D

function sayError(theProblem) {
    sendChat("Status", "/w gm " + theProblem, null, { noarchive: true});
}

function getCharID(charName) {
    var characters = findObjs({ type: "character", name: charName })[0];

    if(characters === undefined) {
        sayError("'" + charName + "'" + " doesn't seem to exist.")
        return false;
    }

    var characterID = characters.get("_id");
    return characterID;
}

function tableImage(tableObjName, tableSide) {
    //Check if theres an RollableTable with the same name as whatever's written in the gmnotes
    var tableObj = findObjs({_type : "rollabletable", name : tableObjName})[0];
    if(tableObj == undefined) {
        sayError("The table '" + tableObjName + "'" + " doesn't seem to exist.")
        return false;
    }

    //Get the contents of the RollableTable
    var tableItemsObj = findObjs({_type : "tableitem", _rollabletableid : tableObj.get("_id")});

    //Exit if the table is empty
    if(tableItemsObj.length < 1) {
        sayError("The table '" + tableObjName + "'" + " seems to be empty")
        return false;
    }

    //Set table side to be equal the first bar
    var newTableSide = tableItemsObj[tableSide];
    if(newTableSide == undefined) {
        sayError("Tablerow " + tableSide + "of '" + tableObjName + "'" + " doesn't seem to exist")
        return false;
    }

    //Extract the URL from the table
    var newTableURL = decodeURIComponent(newTableSide.get("avatar"));

    //exit if the URL is empty (i.e. there is no token loaded for the table field we picked)
    if(newTableURL == "") {
        sayError("Tablerow " + tableSide + "of '" + tableObjName + "'" + " doesn't seem to have an image")
        return false;
    }

    //Choose thumb graphics as that's the only option that can be set
    var newTableURL = newTableURL.replace("/max.","/thumb.");
    var newTableURL = newTableURL.replace("/med.","/thumb.");

    //Finish by setting the tokens displayed graphics with the new random side.
    return newTableURL;
}

function getAttribute(attributeName, characterID) {
    var findAtt = findObjs({name: attributeName, _type: "attribute", _characterid: characterID})[0];

    if(findAtt === undefined) {
        var findAtt = createObj("attribute", {
            name: attributeName,
            current: "",
            characterid: characterID
        });

        sayError("Attribute " + "'" + attributeName + "'" + " not found, creating it...");
    }

    return findAtt;
}

//END FUNCTIONS



on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.includes("!status ", 0) === true) {

        var remover = msg.content.replace("!status ", " "), //Replaces "!status " with a blank space
            split = remover.split(" --"), //Seperates the names whenever there's a " --" 
            currentPageId = Campaign().get("playerpageid"), //Gets the current page
            attributeType = ["stress", "trauma", "armor", "armor_heavy", "armor_special"], //An array with all the stats
            tableName = ["stress", "trauma", "armor", "heavy", "special"]; //An array with all the table names

            //Runs the following code once for each name in the message
        for (i = 1, o = 120; split[i] !== undefined ; i++, o += 210) {
            var characterId = getCharID(split[i]);
            
            if(characterId === false) {
                return
            }
            
            //Generates a random hexcode (color)
            var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});

            //Creates the sliver of colour between the status screen and character portrait
            var banner = createObj("path", { 
                fill: randomColor, 
                stroke: "transparent",
                rotation: 0,
                stroke_width: 5,
                width: 20,
                height: 105,
                top: o+0.5,
                left: 321.5,
                scaleX: 1,
                scaleY: 1,
                controlledby: "",
                layer: "map",
                _path: "[[\"M\",0,0],[\"L\",21,0],[\"L\",21,105.5],[\"L\",0,105.5],[\"L\",0,0]]",
                _pageid: currentPageId
                
            });
            toFront(banner)
            //Runs the following code 5 times per loop
            for (z = 0; z < 5; z++) {

                var attributeObj = getAttribute(attributeType[z], characterId),
                    attributeId = attributeObj.get("_id"),
                    attributeCurrent = attributeObj.get("current"),
                    attributeNumber = attributeCurrent
                    
                if(attributeNumber === "on") {
                    var attributeNumber = 1
                }
                
                if(attributeNumber === "") {
                    var attributeNumber = 0
                }
                
                var tableIMG = tableImage(tableName[z], attributeNumber)
                
                if (tableIMG === false) {
                    return
                }
                
                //Creates the Stress, Trauma, Armor, Heavy and Special status screens.
                var screen = createObj("graphic", {
                    subtype: "token",
                    _pageid: currentPageId,
                    left: 577,
                    top: o,
                    isdrawing: true,
                    width: 490,
                    height: 105,
                    name: "status",
                    represents: characterId,
                    gmnotes: tableName[z],
                    bar1_link: attributeId,
                    imgsrc: tableIMG,
                    layer: "map"
                })
                
                toFront(screen)
                attributeObj.set("current", attributeCurrent)
            };


            //Creates the harm text
            var text = createObj("text", {
                _pageid: currentPageId,
                left: 500,
                top: o+80,
                text: "HARM: ",
                font_size: 16,
                color: "rgb(217,217,217)",
                font_family: "Contrail One",
                layer: "map"
            })
            toFront(text)
            
            //sets the current value of "harm_text" to the ID of the newly created text object
            var textId = text.get("_id"),
                harmText = getAttribute("harm_text", characterId).set("current", textId)

            //Gets the images from the various character sheets and converts them for thumbnail use
            var tokenImg = findObjs({ type: 'character', name: split[i] })[0].get("avatar"),
                tokenImg = tokenImg.replace("/max.","/thumb."),
                tokenImg = tokenImg.replace("/max.","/thumb."),
                injuryImg = tableImage("injury", 0)
            
            if(injuryImg === false) {
                return
            }
                
            //Creates a token using the image from the character sheets.
            var portrait = createObj("graphic", {
                subtype: "token",
                layer: "map",
                top: o,
                left: 260,
                width: 105,
                height: 105,
                imgsrc: tokenImg,
                _pageid: currentPageId
            })
            toFront(portrait)
            
            //Creates an initially invisible image above the token image 
            var injury = createObj("graphic", {
                subtype: "token",
                name: "injury",
                gmnotes: "injury",
                represents: characterId,
                layer: "map",
                top: o,
                left: 260,
                width: 105,
                height: 105,
                imgsrc: injuryImg,
                _pageid: currentPageId 
            })
            toFront(injury)
        
        }

    }
});

on("change:attribute", function(obj) {
    //only run if the name of the changed attribute includes "harm"
    var name = obj.get("name"),
        nameCheck = name.includes("harm");
        
    
    if(nameCheck === true) {
        var belongsTo = obj.get("characterid"),
            token = findObjs({type: "graphic", subtype: "token", name: "injury", represents: belongsTo})[0],
            attribute = 0,
            harmCurrent = [],
            harmTextId = getAttrByName(belongsTo, 'harm_text'),
            attributeType = ["harm1_1", "harm1_2", "harm2_1", "harm2_2", "harm3"]

            if(harmTextId == undefined) {
                return;
            }
            
        var harmText = getObj('text', harmTextId);
        
        
        for(i = 0; i < 5; i++) {
            var harm = getAttribute(attributeType[i], belongsTo).get("current")
            harmCurrent.push(harm)
            if(harm !== "") {
                var attribute = attribute + 1
                
            }
            
        }
        
        var harm3 = getAttribute(attributeType[5], belongsTo).get("current")
        harmCurrent.push(harm3)
        if(harm3 !== "") {
            var attribute = attribute + 2
        }
        
        //Finish by setting the tokens displayed graphics with the new random side.
        token.set("imgsrc", tableImage("injury", attribute));
        
        //bunch of if statements to make the final text look pretty
        if(harmCurrent[0] !== "" || harmCurrent[1] !== "") {
            var h1 = "1 ("
            var h1p = ") Less Effect.  "
        } else {
            var h1 = ""
            var h1p = ""
        };
        
        if(harmCurrent[0] !== "" && harmCurrent[1] !== "") {
            var h1c = ", "
        } else {
            var h1c = ""
        };
        
        if(harmCurrent[2] !== "" || harmCurrent[3] !== "") {
            var h2 = "2 ("
            var h2p = ") -1d.  "
        } else {
            var h2 = ""
            var h2p = ""
        };
            
        if(harmCurrent[2] !== "" && harmCurrent[3] !== "") {
            var h2c = ", "
        } else {
            var h2c = ""
        };
        
        if(harmCurrent[4] !== "") {
            var h3 = "3 ("
            var h3p = ") Needs Help."
        } else {
            var h3 = ""
            var h3p = ""
        };
        
        harmText.set("text", "HARM: " + h1 + harmCurrent[0] + h1c + harmCurrent[1] + h1p + h2 + harmCurrent[2] + h2c + harmCurrent[3] + h2p + h3 + harmCurrent[4] + h3p)

        } return;

})

//runs whenever the bar1 value of a token changes
on("change:token:bar1_value", function(obj) {
    //only runs if the token represents a character and the name of the token is "status"
    if(obj.get("represents") != "" && obj.get("name") === "status") {
        
        //checks the gmnotes 
        var check = obj.get("gmnotes")
        
        //gets the value of bar 1 and exits out if it's undefined
        if(obj.get("bar1_value") != undefined) {
            var attribute = obj.get("bar1_value")
        } else {
            return;
        }
        
        //The various armours set to "on" instead of 1, this fixes that
        if(attribute === "on") {
            var attribute = 1
        }
        

        //Finish by setting the tokens displayed graphics with the new random side.
        obj.set("imgsrc", tableImage(check, attribute));
        
    }
});