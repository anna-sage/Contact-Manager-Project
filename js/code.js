const urlBase = 'http://cop4331groupss.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
				console.log("after assignment " + userId);
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
				console.log("after saveCookie: " + userId);
	
				window.location.href = "contact.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
	console.log("after try catch block: " + userId);
}

// Loads in the contacts associated with a particular user.
function loadContacts()
{
	let tmp = {
        search: "",
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);
	
    let url = urlBase + '/SearchContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.log(jsonObject.error);
                    return;
                }

				// Prepare data to be added to table rows.
				let text = "";
				for (let i = 0; i < jsonObject.results.length; i++)
				{
					text += "<tr id=\'row" + i + "\'>";
	
					// Profile picture.
					text += "<td class=\'contactIconArea\'>";
					text += "<img src=\'images/planeticon1.png\' alt=\'Default profile picture\' class=\'icons float-start\'></td>";
	
					// Contact information.
					text += "<td>" + jsonObject.results[i].FirstName + "</td>";
					text += "<td>" + jsonObject.results[i].LastName + "</td>";
					text += "<td>" + jsonObject.results[i].Phone + "</td>";
					text += "<td>" + jsonObject.results[i].Email + "</td>";

					// Edit and delete buttons.
					text += "<td class=\'contactIconArea\'>";
					text += "<button class=\'contactBtns\'>";
					text += "<span class=\'material-symbols-outlined\'>edit</span>";
					text += "</button></td>";

					text += "<td class=\'contactIconArea\'>";
					text += "<button class=\'contactBtns\'>";
					text += "<span class=\'material-symbols-outlined\'>delete</span>";
					text += "</button></td>";

					text += "</tr>";
				}

				// Add the contacts to the page.
				document.getElementById("contactsBody").innerHTML = text;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err) {
		console.log(err.message);
	}
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		// document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
	let newFname = document.getElementById("addFname").value;
	let newLname = document.getElementById("addLname").value;
	let newPhNum = document.getElementById("addPhNum").value;
	let newEmail = document.getElementById("addEmail").value;

	// document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {
		firstName: newFname,
		lastName: newLname,
		phone: newPhNum,
		email: newEmail,
		userId: userId
	};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				loadContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("addContact API error:" + err.message);
	}
	
}

function contactFormValidation()
{
	let fnameErr = lnameErr = phErr = emailErr = false;

	let formElement = document.getElementById("addForm");
	let fnameElement = document.getElementById("addFname");
	let lnameElement = document.getElementById("addLname");
	let phNumElement = document.getElementById("addPhNum");
	let emailElement = document.getElementById("addEmail");

	// Automatically capitalize the first and last names.
	let fnameFormatted = fnameElement.value.charAt(0).toUpperCase() + fnameElement.value.slice(1);
	let lnameFormatted = lnameElement.value.charAt(0).toUpperCase() + lnameElement.value.slice(1);
	fnameElement.innerHTML = fnameFormatted;
	lnameElement.innerHTML = lnameFormatted;
	console.log("formatted name: " + fnameFormatted + " " + lnameFormatted);

	// Validate the first name.
	if (fnameElement.innerHTML == "")
	{
		fnameElement.classList.add("is-invalid");
		console.log(fnameElement.classList.contains("is-invalid"));
		fnameErr = true;
	}

	// Validate the phone number.
	let phNum = phNumElement.value.replace(/\D/g,'');
	let phRegex = /[(]?[0-9]{3}[)]?[-\.]?[0-9]{3}[-\.]?[0-9]{4}$/
	console.log("phone number regex test: " + phRegex.test(phNum));
	if (phNum == "" || phRegex.test(phNum) == false)
	{
		document.getElementById("addPhNum").classList.add("is-invalid");
		console.log(document.getElementById("addPhNum").classList.contains("is-invalid"));
		phErr = true;
	}

	// Format the phone number.
	if (phErr == false)
	{
		phNum = phNum.substring(0, 10);
		phNum = phNum.slice(0, 3) + "-" + phNum.slice(3, 6) + "-" + phNum.slice(6);
		document.getElementById("addPhNum").innerHTML = phNum;
		phNumElement.classList.add("is-valid");
	}

	// todo handle email

	if ((fnameErr || phErr || emailErr) == true)
	{
		formElement.classList.add("was-validated");
		return false;
	}

	formElement.classList.remove("was-validated");
	// Clear fields
	formElement.reset();
	return true;
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}
