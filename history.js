var cipher = { '0': 't', '1': 'S', '2': ' ', '3': 'm', '4': '9', '5': 'L', '6': 'h', '7': 'q', '8': 'B', '9': '4', u: 'd', d: 'u', '<': 'W', W: '<', m: '3', '$': '(', '(': '$', ' ': '2', B: '8', Q: '#', '#': 'Q', '[': ',', ',': '[', N: '\'', '\'': 'N', v: 'O', O: 'v', s: '?', '?': 's', ')': '`', '`': ')', '>': '}', '}': '>', q: '7', E: 'Z', Z: 'E', H: 'V', V: 'H', '.': '|', '|': '.', S: '1', D: 'y', y: 'D', n: '^', '^': 'n', '&': ':', ':': '&', J: '_', _: 'J', K: 'b', b: 'K', c: 'g', g: 'c', X: 'f', f: 'X', T: '-', '-': 'T', h: '6', r: '/', '/': 'r', '*': 'k', k: '*', M: '%', '%': 'M', I: 'i', i: 'I', '+': 'p', p: '+', R: ';', ';': 'R', j: 'l', l: 'j', U: 'w', w: 'U', '~': 'z', z: '~', t: '0', L: '5', ']': '=', '=': ']', '{': 'F', F: '{', e: 'P', P: 'e', '"': 'a', a: '"', o: 'x', x: 'o', '@': 'Y', Y: '@', '\\': 'G', G: '\\', C: '', '': 'C', '!': 'A', A: '!' };
var page = 0;
var users = {}; // all items in dictionary MUST be encrypted, good idea to look for other methods of password storing



/**********************
**  Account Options  **
**********************/

function user(name, master, key1, key2)
{
    if (master == key1 || master == key2 || key1 == key2) // making sure no two passwords are the same
    {
        console.log("Passwords can not be the same")
        return;
    }
    this.name = name;
    this.password = master;
    this.key1 = key1;
    this.key2 = key2;
}

function createUser(name, master, key1, key2)
{
    var account = new user(name, master, key1, key2);
    if (account != undefined)
    {
        users[name] = account;
    }
    else
    {
        console.log("Error creating account");
    }
}

function changePassword(name, master, type, oldKey, newKey)
{
    var account = users[name];
    if (account == undefined)
    {
        console.log("Invalid account name");
        return;
    }
    if (master != account.password)
    {
        console.log("Invalid master password");
        return;
    }
    if (type == "password")
    {
        account.password = newKey;
    }
    if (type == "key1" && account.key1 == oldKey)
    {
        account.key1 = newKey;
    }
    if (type == "key2" && account.key2 == oldKey)
    {
        account.key2 = newKey;
    }
}

function deleteUser(name, master)
{
    if (users[name].password == master)
    {
        delete users[name];
    }
    else
    {
        console.log("Invalid master password");
    }
}



/********************
**  Login Options  **
********************/

function showMore()
{
    var button = document.createElement("input");
    button.type = "button";
    button.value = "Show More";
    button.className = "links";
    button.onclick = function()
    {
        button.parentNode.removeChild(button);
        chrome.storage.local.get(null, function(objects)
        {
            var linkKeys = objects["keys"];
            for (i = linkKeys.length - 1 - page * 100; i > -1 && i > linkKeys.length - 1 - 100 - (page * 100); i--)
            {
                addElement(decrypt(linkKeys[i]), decrypt(objects[linkKeys[i]]));
            }
            page++;
            if (linkKeys[linkKeys.length - 1 - page * 100] != undefined)
            {
                showMore();
            }
        });
    }
    document.body.appendChild(button);
}

/**
* function showHistory()
* @purpose: shows the real history, iterating through the array of keys in storage
* @note: needs to be changed to reflect only recent elements
* @note: the keys may need to be sorted, but sorting millions of items will be time consuming
**/
function showHistory()
{
    chrome.storage.local.get(null, function(objects)
    {
        clearBody();
        var linkKeys = objects["keys"];
        for (var i = linkKeys.length - 1; i > -1 && i > linkKeys.length - 1 - 100 - (page * 100); i--)
        {
            addElement(decrypt(linkKeys[i]), decrypt(objects[linkKeys[i]]));
        }
        page++;
        if (linkKeys[linkKeys.length - 1 - page * 100] != undefined)
        {
            showMore();
        }
    })
}

/**
* function showFakestory()
* @purpose: show fake history for emergency logins
**/
function showFakestory()
{
    clearBody();
    var createFakeLink = function()
    {
        for (var i = 0; i < 100; i++)
        {
            var object = {"url": "http://www.google.com", "tags": null};
            var newLink = document.createElement("div");
            newLink.innerHTML = object["url"];
            newLink.className = "links";
            document.body.appendChild(newLink);
        }
    }
    createFakeLink();
    var createButton = function()
    {
        button = document.createElement("input");
        button.type = "button";
        button.value = "Show More";
        button.className = "links";
        button.onclick = function()
        {
            button.parentNode.removeChild(button);
            createFakeLink();
            createButton();
        };
        document.body.appendChild(button);
    }
    createButton();
}

/**
* function clearBody()
* @purpose: clears all the elements of the class name "links" so that the body is not cluttered with old items
* @note: might be inefficient, check later
**/
function clearBody()
{
    page = 0;
    var elements = document.getElementsByClassName("links")
    var elementsLength = elements.length
    for (var i = 0; i < elementsLength; i++)
    {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

/**
* function login(name, password)
* @purpose: displays the history according to the username and password
* @param: name: the name of the user who wants to login
* @param: password: the password of the user who wants to login
* @note: should extend other options besides the basic three
**/

function login(name, password)
{
    if (password == users[name].password)
    {
        showHistory();
    }
    else if (password == users[name].key1)
    {
        showFakestory();
    }
    else if (password == users[name].key2)
    {
        chrome.storage.local.clear();
    }
    else
    {
        alert("Username and password combination incorrect. Please try again.") // we can also implement that if you try too many times, chrome.storage.local will automatically clear itself (good for preventing brute force attacks)
    }
}



/***********************
**  Helper Functions  **
***********************/

/**
* function addElement(objectArray, keyArray, index)
* @purpose: adds a link element to the body of history.html
* @param: objectArray: the array of objects to access, usually chrome.storage.local.get(null, function(objects))
* @param: keyArray: the array of keys
* @param: index: the index of the desired key in the keyArray
* @note: missing some abstraction possibly
* @note: lots of changes to this method, showHistory, and showMore, go back in commit history, updated 14.03.15
**/
function addElement(key, object)
{
    var newLink = document.createElement("div");
    var theLink = JSON.parse(object);
    newLink.innerHTML = key.substring(0, 4) + ":" + key.substring(4, 6) + ":" + key.substring(6, 8) + ":" + key.substring(8, 10) + ":" + key.substring(10, 12) + ":" + key.substring(12, 14) + ":" + key.substring(14, 17) + " : " + theLink["url"] + " : " + theLink["tags"] + " : " + theLink["state"];
    newLink.className = "links";
    document.body.appendChild(newLink);
}


/****************
**  Listeners  **
****************/

/**
* function onSubmitted()
* @purpose: function that will draw out the name and password from the form
* @note: should consider the security of this function, and of the document, since the password and username can be withdrawn
**/
function onSubmitted()
{
    document.getElementById("login").addEventListener("submit", function(event)
    {
        event.preventDefault();
        login(this.username.value, this.password.value);
    })
}

/**
* @purpose: adds listener to find out when the submit button pressed
**/
window.addEventListener("load", onSubmitted, false);

createUser("william", "secret", "notsecret", "clear");