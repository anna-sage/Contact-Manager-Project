const urlBase = 'http://cop4331groupss.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let initLoaded = false;
let contacts; // All contacts associated with the user.

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

function doRegister()
{
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    
    let login = document.getElementById("registerName").value;
    let password = document.getElementById("registerPassword").value;
//    var hash = md5( password );
    
    document.getElementById("registerResult").innerHTML = "";

    let tmp = {firstName:firstName,lastName:lastName,login:login,password:password};
//    var tmp = {login:login,password:hash};
    let jsonPayload = JSON.stringify( tmp );
    
    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function() 
        {
            if (this.status == 409) {
                document.getElementById("registerResult").innerHTML = "User already exists";
                return;
            }

            else if (this.readyState == 4 && this.status == 200) 
            {
                let jsonObject = JSON.parse( xhr.responseText );
                userId = jsonObject.id;
                document.getElementById("registerResult").innerHTML = "User added";
                console.log("after assignment " + userId);
        
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
        document.getElementById("registerResult").innerHTML = err.message;
    }
    console.log("after try catch block: " + userId);
}

// Loads in the contacts associated with a particular user.
function displayContacts(srch)
{
	let tmp = {
        search: srch,
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);

	console.log("load json payload: " + jsonPayload);
	
    let url = urlBase + '/SearchContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	// let resultsFound = false;
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
					console.log("search returned " + jsonObject.results[i].FirstName);
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
				console.log("text is " + text);

				// On initial page load, store all contacts associated with the user.
				if (!initLoaded)
					contacts = document.getElementById("contactsBody").getElementsByTagName("tr");

				initLoaded = true;
				// resultsFound = jsonObject.results.length > 0;
			}
		};
		xhr.send(jsonPayload);
		// return resultsFound;
	}
	catch(err) {
		console.log(err.message);
		// document.getElementById("contactsBody").innerHTML = "";
		// console.log("initLoaded = " + initLoaded);
		// if (initLoaded)
		// 	console.log("should be displaying popover");
		// if (initLoaded)
		// 	srchPopover.show();
		// return false;
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
	let newphoneNum = document.getElementById("addPhNum").value;
	let newEmail = document.getElementById("addEmail").value;

	// document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {
		firstName: newFname,
		lastName: newLname,
		phone: newphoneNum,
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
				displayContacts("");
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("addContact API error:" + err.message);
	}
	
}

function editContact(contactIndex)
{
	let currFname = document.getElementById("fName_" + contactIndex).value;
	let currLname = document.getElementById("lName_" + contactIndex).value;
	let currPhNum = document.getElementById("phone_" + contactIndex).value;
	let currEmail = document.getElementById("email_" + contactIndex).value;

	document.getElementById(editFname).setAttribute("value", currFname);
	document.getElementById(editLname).setAttribute("value", currLname);
	document.getElementById(editPhNum).setAttribute("value", currPhNum);
	document.getElementById(editEmail).setAttribute("value", currEmail);

	document.getElementById(updateButton).setAttribute("onclick", "javascript: updateSubmit(" + contactIndex + ");");
}

function updateSubmit(cid) {
	if(validateContactForm('editForm', 'editPhNum', 'editEmail')) 
	{
	  updateContact(cid); 
	  closeModalForm('editModal', 'editForm');
	}
}

function updateContact(contactIndex)
{
	let saveFname = document.getElementById("editFname").value;
	let saveLname = document.getElementById("editLname").value;
	let savephoneNum = document.getElementById("editPhNum").value;
	let saveEmail = document.getElementById("editEmail").value;

	let tmp = {
		contactId: cid_list[contactIndex],
		firstName: saveFname,
		lastName: saveLname,
		phone: savephoneNum,
		email: saveEmail
	};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/UpdateContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				displayContacts("");
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("UpdateContact API error:" + err.message);
	}
	
}

function formatName(input)
{
	return input.charAt(0).toUpperCase() + input.slice(1);
}

// Converts a phone number to the expected format.
function formatPhoneNumber(input)
{
	input = input.replace(/\D/g, '');
	input = input.slice(0, 3) + "-" + input.slice(3, 6) + "-" + input.slice(6);
	return input;
}

function validateContactForm(formId, phoneId, emailId)
{
	let fnameErr = lnameErr = phoneErr = emailErr = false;

	let form = document.getElementById(formId);
	let phone = document.getElementById(phoneId);
	let email = document.getElementById(emailId);

	// Validate the phone number.
	let phoneNum = phone.value;
	let phRegex = /^[(]?[0-9]{3}[)]?[-\.]?[0-9]{3}[-\.]?[0-9]{4}$/;
	if (phRegex.test(phoneNum) == false)
	{
		phone.setCustomValidity("Invalid field.");
		phoneErr = true;
	}

	// Format the phone number.
	phone.value = formatPhoneNumber(phoneNum);

	// Validate the email.
	let emailRegex = /^[a-zA-Z0-9_\-.]+@[a-z]+\.[a-z]+$/;
	if (emailRegex.test(email.value) == false)
	{
		email.setCustomValidity("Invalid field.");
		emailErr = true;
	}

	if ((fnameErr || phoneErr || emailErr) == true)
	{
		form.classList.add("was-validated");
		return false;
	}

	return true;
}

function closeModalForm(modalId, formId)
{
	let form = document.getElementById(formId);
	form.classList.remove("was-validated");
	form.reset();
	bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
}

function searchContacts()
{
	// for (const c of contacts)
	// 	console.log(c);
	// Hide the popover.
	// const srchPopover = bootstrap.Popover.getOrCreateInstance("#searchBtn");
	// srchPopover.hide();

	// Clear the "no results found" text.
	document.getElementById("noResultsTxt").style.display = "none";

	const srch = document.getElementById("searchText").value.toLowerCase();
	const terms = srch.split(" ");
	console.log("terms: " + terms);

	// If searching a single term, look through all columns.
	if (terms.length == 1)
	{
		console.log("display returns: " + displayContacts(terms[0]));
		return;
	}

	// If searching two terms, search for matching first and last name.
	const matches = new Set();
	let matchFound = false;
	for (let i = 0; i < contacts.length; i++)
	{
		// console.log("iteration " + i);
		let fName = contacts[i].getElementsByTagName("td")[1].innerText.toLowerCase();
		let lName = contacts[i].getElementsByTagName("td")[2].innerText.toLowerCase();

		// console.log("-- checking first: " + fName);
		// console.log("\t-- included? " + terms.includes(fName));
		// console.log("-- checking last: " + lName);
		// console.log("\t-- included? " + terms.includes(lName));

		// Hide all by default and keep track of matches.
		contacts[i].style.display = "none";
		if (fName.includes(terms[0]) && lName.includes(terms[1]))
		{
			// console.log("\t-- match!");
			matches.add(contacts[i]);
			matchFound = true
		}
	}

	if (matches.size > 0)
	{
		// Display only the matches.
		for (const row of matches)
			row.style.display = "";
	}
	else
	{
		// srchPopover.show();
		document.getElementById("noResultsTxt").style.display = "";
	}
}