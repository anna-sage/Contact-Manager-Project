const urlBase = 'http://cop4331groupss.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let loadedAll = false;
const cid = []; // All contact ids.
let lastContactIdx = -1; // Index of current final contact.
const amtImages = 9; // Amount of available profile pics.

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	let hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	// let tmp = {login:login,password:password};
	let tmp = {login:login,password:hash};
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
	
				window.location.href = "contact.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doRegister()
{
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    
    let login = document.getElementById("registerName").value;

	//makes sure password is valid
	if(!validPassword(document.getElementById("registerPassword").value))
	{
    	document.getElementById("registerResult").innerHTML = "Password is invalid";
	}

	else
	{
		document.getElementById("validatePassword").style.display = "none";
    	let password = document.getElementById("registerPassword").value;
		let hash = md5( password );

    	document.getElementById("registerResult").innerHTML = "";

    	// let tmp = {firstName:firstName,lastName:lastName,login:login,password:password};
    	let tmp = {firstName:firstName,lastName:lastName,login:login,password:hash};
    	let jsonPayload = JSON.stringify( tmp );
    
    	let url = urlBase + '/Register.' + extension;

    	let xhr = new XMLHttpRequest();
    	xhr.open("POST", url, true);
    	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    	try
    	{
        	xhr.onreadystatechange = function() 
        	{
				if (this.readyState==4)
				{
            		if (this.status == 409) 
					{
                		document.getElementById("registerResult").innerHTML = "User with this username already exists";
            	    	return;
            		}

            		else if (this.status == 200)
            		{
                		let jsonObject = JSON.parse( xhr.responseText );
              	  		userId = jsonObject.id;
                		//document.getElementById("registerResult").innerHTML = "User added";
                		console.log("after assignment " + userId);
        
                		firstName = jsonObject.firstName;
                		lastName = jsonObject.lastName;

                		saveCookie();
                		console.log("after saveCookie: " + userId);
    
                		window.location.href = "contact.html";
            		}

					//handles other possible errors
					else
					{
						document.getElementById("registerResult").innerHTML = "An unexpected error has occurred. Status code: "+this.status;
            	    	return;
					}
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
}

//at least 8 characters, at least one lowercase letter, at least one uppercase letter, at least one digit
function validPassword(input)
{
	valid=true;

	if(input.length < 8)
	{
		document.getElementById("8characters").style.display = "";
		valid = false;
	}
	else
	{
		document.getElementById("8characters").style.display = "none";
	}

	if(!/[a-z]/.test(input))
	{
		document.getElementById("lower").style.display = "";
		valid = false;
	}
	else
	{
		document.getElementById("lower").style.display = "none";
	}

	if(!/[A-Z]/.test(input))
	{
		document.getElementById("upper").style.display = "";
		valid = false;
	}
	else
	{
		document.getElementById("upper").style.display = "none";
	}

	if(!/\d/.test(input))
	{
		document.getElementById("digit").style.display = "";
		valid = false;
	}
	else
	{
		document.getElementById("digit").style.display = "none";
	}
		
	return valid;
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

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.log(jsonObject.error);

					// Display no contacts found message.
					document.getElementById("contactsBody").innerHTML = "";
					document.getElementById("noResultsTxt").style.display = "";
                    return;
                }

				// Prepare data to be added to table rows.
				let text = "";
				for (let i = 0; i < jsonObject.results.length; i++)
				{
					console.log("search returned " + jsonObject.results[i].FirstName);
					text += "<tr id=\'row" + i + "\'>";

					//Store contactID in cid
					cid[i] = jsonObject.results[i].ID;
	
					// Generate random profile picture.
					const imgNum = Math.floor(Math.random() * amtImages) + 1;
					text += "<td class=\'contactIconArea\'>";
					text += "<img src=\'images/contactIcons/contactIcon" + imgNum + ".png\' alt=\'Random profile picture\' class=\'icons float-start\'></td>";
	
					// Contact information.
					text += "<td>" + jsonObject.results[i].FirstName + "</td>";
					text += "<td>" + jsonObject.results[i].LastName + "</td>";
					text += "<td>" + jsonObject.results[i].Phone + "</td>";
					text += "<td>" + jsonObject.results[i].Email + "</td>";

					// Edit and delete buttons.
					text += "<td class=\'contactIconArea\'>";
					text += "<button class=\'contactBtns\' aria-label=\'Edit\'>";
					text += "<span class=\'material-symbols-outlined\' data-bs-toggle=\'modal\' data-bs-target=\'#editModal\' onclick=\'editContact(" +  i + ")\'>edit</span>";
					text += "</button></td>";

					text += "<td class=\'contactIconArea\'>";
					text += "<button class=\'contactBtns\' onclick='confirmDelete(" + jsonObject.results[i].ID + ");'>";
					text += "<span class=\'material-symbols-outlined\'>delete</span>";
					text += "</button></td>";

					text += "</tr>";
					lastContactIdx = i;
				}

				// Add the contacts to the page.
				document.getElementById("contactsBody").innerHTML = text;
				console.log("text is " + text);

				// On initial page load or post addContact(),
				// store all contacts associated with the user.
				if (!loadedAll)
					contacts = document.getElementById("contactsBody").getElementsByTagName("tr");

				loadedAll = true;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err) 
	{
		// Displaying error message to the user instead of just logging to the console
        document.getElementById("noResultsTxt").innerText = "Error loading contacts: " + err.message;
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
		// todo delete this block?
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
				let jsonObject = JSON.parse(xhr.responseText);
				console.log(jsonObject);

				// Create new table row with new contact information.
				let text = generateContact(newFname, newLname, newphoneNum, newEmail, jsonObject.contactId);

				// Insert new contact at the top.
				document.getElementById("contactsBody").insertAdjacentHTML("afterbegin", text);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("noResultsTxt").innerText = "Error adding contact: " + err.message;
	}
	
	// In case a user is adding their first contact.
	// todo - why am i doing this?
	document.getElementById("noResultsTxt").style.display = "none";
}

function generateContact(fn, ln, ph, em, id)
{
	lastContactIdx++;
	let text = "<tr id=\'row" + lastContactIdx + "\'>";
	
	// Generate random profile picture.
	const imgNum = Math.floor(Math.random() * amtImages) + 1;
	text += "<td class=\'contactIconArea\'>";
	text += "<img src=\'images/contactIcons/contactIcon" + imgNum + ".png\' alt=\'Random profile picture\' class=\'icons float-start\'></td>";

	// Contact information.
	text += "<td>" + fn + "</td>";
	text += "<td>" + ln + "</td>";
	text += "<td>" + ph + "</td>";
	text += "<td>" + em + "</td>";

	// Edit and delete buttons.
	text += "<td class=\'contactIconArea\'>";
	text += "<button class=\'contactBtns\' aria-label=\'Edit\'>";
	text += "<span class=\'material-symbols-outlined\' data-bs-toggle=\'modal\' data-bs-target=\'#editModal\' onclick=\'editContact(" +  lastContactIdx + ")\'>edit</span>";
	text += "</button></td>";

	text += "<td class=\'contactIconArea\'>";
	text += "<button class=\'contactBtns\' onclick='confirmDelete(" + id + ");'>";
	text += "<span class=\'material-symbols-outlined\'>delete</span>";
	text += "</button></td></tr>";

	// Update the contact ids array with the new id.
	cid[lastContactIdx] = id; 

	return text;
}

//Copies current contact info into edit modal
function editContact(cx)
{
	//Get current contact info
	let contactRow = document.getElementById("row" + cx);
	let currFname = contactRow.getElementsByTagName("td")[1].innerText;
	let currLname = contactRow.getElementsByTagName("td")[2].innerText;
	let currPhNum = contactRow.getElementsByTagName("td")[3].innerText;
	let currEmail = contactRow.getElementsByTagName("td")[4].innerText;
	
	//Put contact info in fields 
	document.getElementById('editFname').setAttribute("value", currFname);
	document.getElementById('editLname').setAttribute("value", currLname);
	document.getElementById('editPhNum').setAttribute("value", currPhNum);
	document.getElementById('editEmail').setAttribute("value", currEmail);

	//Update contact 
	document.getElementById('updateButton').setAttribute("onclick", "javascript: updateSubmit(" + cx + ");");
}

//Contact validation tied to button
function updateSubmit(cx) {
	if(validateContactForm('editForm', 'editPhNum', 'editEmail')) 
	{
	  updateContact(cx); 
	  closeModalForm('editModal', 'editForm');
	}
}

//Update contact
function updateContact(cx)
{
	let saveFname = document.getElementById("editFname").value;
	let saveLname = document.getElementById("editLname").value;
	let savephoneNum = document.getElementById("editPhNum").value;
	let saveEmail = document.getElementById("editEmail").value;

	let tmp = {
		contactId: cid[cx],
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
				//Modify contact info in table row
				let contactRow = document.getElementById("row" + cx);
				contactRow.getElementsByTagName("td")[1].innerHTML = saveFname;
				contactRow.getElementsByTagName("td")[2].innerHTML = saveLname;
				contactRow.getElementsByTagName("td")[3].innerHTML = savephoneNum;
				contactRow.getElementsByTagName("td")[4].innerHTML = saveEmail;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("noResultsTxt").innerText = "Error updating contact: " + err.message;
	}
	
}

// Capitalizes a first or last name.
function formatName(input)
{
	return input.charAt(0).toUpperCase() + input.slice(1);
}

// Converts a phone number to the expected format.
function formatPhoneNumber(input)
{
	input = input.replace(/\D/g, '');
	if (input.length > 6)
		input = input.slice(0, 3) + "-" + input.slice(3, 6) + "-" + input.slice(6);
	else if (input.length > 3)
		input = input.slice(0, 3) + "-" + input.slice(3);
	return input;
}

// Validates the add/update forms.
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

	// Validate the email using the world's ugliest regex.
	let emailRegex = /^[a-zA-Z0-9!#\$%&'\*\+\-\/=\?\^_`\{|\}~.]+@[a-z]+\.[a-z]+$/;
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

// Close a modal for adding or updating contacts.
function closeModalForm(modalId, formId)
{
	let form = document.getElementById(formId);
	form.classList.remove("was-validated");
	form.reset();
	bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
}

function searchContacts()
{
	// Clear the "no results found" text.
	document.getElementById("noResultsTxt").style.display = "none";

	const srch = document.getElementById("searchText").value.toLowerCase();
	const terms = srch.split(" ");
	console.log("terms: " + terms + "\nsize: " + terms.size);

	let contacts = document.getElementById("contactsBody").getElementsByTagName("tr");
	let matchFound = false;

	for (let i = 0; i < contacts.length; i++)
	{
		contacts[i].style.display = "none"; // Hide current contact.

		let fName = contacts[i].getElementsByTagName("td")[1].innerText.toLowerCase();
		let lName = contacts[i].getElementsByTagName("td")[2].innerText.toLowerCase();

		// Want to search all fields of every contact if the search term is a single string.
		if (terms.length == 1)
		{
			let phNum = contacts[i].getElementsByTagName("td")[3].innerText.toLowerCase();
			let email = contacts[i].getElementsByTagName("td")[4].innerText.toLowerCase();

			if (fName.includes(terms[0]) || lName.includes(terms[0]) || phNum.includes(terms[0]) || email.includes(terms[0]))
			{
				contacts[i].style.display = "";
				matchFound = true;
			}

			// If the search term is all digits, add dashes to compare against phone number.
			if (/^[\d]{1,10}$/.test(terms[0]))
			{
				let formattedNum = formatPhoneNumber(terms[0]);
				if (phNum.includes(formattedNum))
				{
					contacts[i].style.display = "";
					matchFound = true;
				}
			}
		}

		// Search for first and last name.
		if (terms.length == 2)
		{
			if (fName.includes(terms[0]) && lName.includes(terms[1]))
			{
				contacts[i].style.display = "";
				matchFound = true;
			}
		}
	}

	if (!matchFound)
	{
		document.getElementById("noResultsTxt").style.display = "";
	}
}

// Displays all contacts and clears search text field.
function clearSearch()
{
	let contacts = document.getElementById("contactsBody").getElementsByTagName("tr");
	for (let i = 0; i < contacts.length; i++)
	{
		contacts[i].style.display = "";
	}

	document.getElementById('searchText').value = '';
}

//confirmDelete function
function confirmDelete(contactId) {
    console.log("Received Contact ID in confirmDelete:", contactId); // check contactID
    if (confirm("Are you sure you want to delete this contact?")) {
        deleteContact(contactId);
    }
}

//deleteContact function
function deleteContact(contactId) {
    let tmp = { contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);

    console.log("Sending payload to DeleteContact:", jsonPayload); // Check what's happening

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Refresh the contact list or handle the response
                console.log("Contact has been deleted");
                displayContacts("");
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        console.error("Error in deleteContact: " + err.message);
    }
}