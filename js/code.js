const urlBase = 'http://cop4331groupss.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let loadedAll = false; // todo i think we don't need this
const contactsPerPage = 10;
let pgNum = 1; // Current page number.
const cid = []; // All contact ids.
let lastContactIdx = -1; // Index of current final contact.
const amtImages = 9; // Amount of available profile pics.

//some navbar stuff for scrolling 
window.onscroll = function() {
    const navbar = document.getElementById('nav');
    if(window.scrollY > 100) { 
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

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
	if(!validPassword(document.getElementById("registerPassword").value, document.getElementById("confirmPassword").value))
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
        
                		firstName = jsonObject.firstName;
                		lastName = jsonObject.lastName;

                		saveCookie();
    
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
	}
}

//at least 8 characters, at least one lowercase letter, at least one uppercase letter, at least one digit
function validPassword(input, matchInput)
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

	if(input!=matchInput)
	{
		document.getElementById("matchInput").style.display = "";
		valid = false;
	}
	else
	{
		document.getElementById("matchInput").style.display = "none";
	}
	
	if(!valid)
	{
		document.getElementById("passwordRequirements").style.display = "";
	}
	else
	{
		document.getElementById("passwordRequirements").style.display = "none";
	}

	return valid;
}

function showPassword() {
	let temp = document.getElementById("registerPassword");
	 
	if (temp.type === "password") {
		temp.type = "text";
	}
	else {
		temp.type = "password";
	}
}

// Loads in the contacts associated with a particular user.
function loadContacts(pg)
{
	clearError();

	let tmp = {
        search: "",
        userId: userId,
		page: pg
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

					// Display no contacts found message.
					document.getElementById("contactsBody").innerHTML = "";
					document.getElementById("noContactsTxt").style.display = "";
                    return;
                }

				if(jsonObject.results.length==0)
				{
					document.getElementById("noContactsTxt").style.display = "";
					return;
				}

				// Prepare data to be added to table rows.
				let tbodyPage = document.createElement("tbody");
				tbodyPage.id = "page" + pg;
				tbodyPage.className = "contactsBody";

				let text = "";
				for (let i = 0; i < jsonObject.results.length; i++)
				{
					let fn = jsonObject.results[i].FirstName;
					let ln = jsonObject.results[i].LastName;
					let ph = jsonObject.results[i].Phone;
					let em = jsonObject.results[i].Email;

					//Store contactID in cid
					cid[i] = jsonObject.results[i].ID;

					// Generate the text to insert into the document.
					text += generateContact(fn, ln, ph, em, cid[i]);
				}

				tbodyPage.innerHTML = text;
				document.getElementById("contacts").appendChild(tbodyPage);
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
				if (jsonObject.error)
				{
					console.log(jsonObject.error);

					// Display the error message.
					document.getElementById("addErrMsg").innerHTML = jsonObject.error;
					document.getElementById("addErr").style.display = "";

					// Make all the fields red and display warning icons.
					let inputs = document.getElementsByClassName("addInput");
					let icons = document.getElementsByClassName("addInvalidIcon");
					for (let i = 0; i < inputs.length; i++)
					{
						inputs[i].style.borderColor = "#dc3545";
						icons[i].style.display = "";
					}

					return;
				}

				// Create new table row with new contact information.
				let text = generateContact(newFname, newLname, newphoneNum, newEmail, jsonObject.contactId);

				// Insert new contact at the top.
				document.getElementById("page" + pgNum).insertAdjacentHTML("afterbegin", text);

				// Do we need to add the contact at the end to the next page?
				let pgIncr = pgNum;
				let curPage = document.getElementById("page" + pgIncr);
				let curContacts = curPage.getElementsByClassName("contact");
				console.log(curPage + " " + curContacts);

				let curChild = curPage.lastChild;
				console.log("the last child is" + curChild);
				curPage.removeChild(curPage.lastChild);

				// Go add the removed element to the top of the next page.
				pgIncr++;

				// while (curContacts.length > contactsPerPage)
				// {
				// 	let curChild = curPage.lastChild;
				// 	console.log("the last child is" + curChild);
				// 	curPage.removeChild(curPage.lastChild);

				// 	// Go add the removed element to the top of the next page.
				// 	pgIncr++;
				// 	break;
				// }

				do
				{
					// Get all the contacts on the current page.
					curContacts = document.getElementsByClassName("contact");
				} 
				while (curContacts.length > 10)

				// In case a user is adding their first contact.
				clearError();

				// Reset fields and validation warnings
				resetForm("add");
			}
		};
		
		xhr.send(jsonPayload);
		
	}
	catch(err)
	{
		document.getElementById("noResultsTxt").innerText = "Error adding contact: " + err.message;
	}
}

function generateContact(fn, ln, ph, em, id)
{
	lastContactIdx++;
	let text = "<tr id=\'row" + lastContactIdx + "\' class=\'contact\'>";
	
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
	text += "<button class=\'contactBtns\' onclick='confirmDelete(" + id + ", " + lastContactIdx + ");'>";
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
	if(validateContactForm('edit', 'editFname', 'editPhNum', 'editEmail')) 
	{
	  updateContact(cx); 
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
				let jsonObject = JSON.parse(xhr.responseText);
				if (jsonObject.error)
				{
					console.log(jsonObject.error);

					// Display the error message.
					document.getElementById("editErrMsg").innerHTML = jsonObject.error;
					document.getElementById("editErr").style.display = "";

					// Make all the fields red and display warning icons.
					let inputs = document.getElementsByClassName("editInput");
					let icons = document.getElementsByClassName("editInvalidIcon");
					for (let i = 0; i < inputs.length; i++)
					{
						inputs[i].style.borderColor = "#dc3545";
						icons[i].style.display = "";
					}

					return;
				}

				//Modify contact info in table row and closes edit modal if valid
				let contactRow = document.getElementById("row" + cx);
				contactRow.getElementsByTagName("td")[1].innerHTML = saveFname;
				contactRow.getElementsByTagName("td")[2].innerHTML = saveLname;
				contactRow.getElementsByTagName("td")[3].innerHTML = savephoneNum;
				contactRow.getElementsByTagName("td")[4].innerHTML = saveEmail;
				resetForm("edit");
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
function validateContactForm(formType, fnameId, phoneId, emailId)
{
	let fnameErr = lnameErr = phoneErr = emailErr = false;

	// Get inputs.
	let fname = document.getElementById(fnameId);
	let phone = document.getElementById(phoneId);
	let email = document.getElementById(emailId);


	if (!fname.value)
	{
		fname.style.borderColor = "#dc3545";
		document.getElementById(formType + "FnameInvalid").style.display = "";
		document.getElementById(formType + "FnameFeedback").style.display = "";
		fnameErr = true;
	}

	// Validate the phone number.
	let phoneNum = phone.value;
	let phRegex = /^[(]?[0-9]{3}[)]?[-\.]?[0-9]{3}[-\.]?[0-9]{4}$/;
	if (phRegex.test(phoneNum) == false)
	{
		// phone.setCustomValidity("Invalid field.");
		phone.style.borderColor = "#dc3545";
		document.getElementById(formType + "PhNumInvalid").style.display = "";
		document.getElementById(formType + "PhNumFeedback").style.display = "";
		phoneErr = true;
	}

	// Format the phone number.
	phone.value = formatPhoneNumber(phoneNum);

	// Validate the email using the world's ugliest regex.
	let emailRegex = /^[a-zA-Z0-9!#\$%&'\*\+\-\/=\?\^_`\{|\}~.]+@[a-z]+\.[a-z]+$/;
	if (emailRegex.test(email.value) == false)
	{
		// email.setCustomValidity("Invalid field.");
		email.style.borderColor = "#dc3545";
		document.getElementById(formType + "EmailInvalid").style.display = "";
		document.getElementById(formType + "EmailFeedback").style.display = "";
		emailErr = true;
	}

	if ((fnameErr || phoneErr || emailErr) == true)
	{
		return false;
	}

	return true;
}

function resetForm(formType)
{
	// Revert invalid or error styling.
	let invIcons = document.getElementsByClassName(formType + "InvalidIcon");
	let inputs = document.getElementsByClassName(formType + "Input");
	for (let i = 0; i < invIcons.length; i++)
	{
		invIcons[i].style.display = "none";
		inputs[i].style.borderColor = "black";
	}

	let feedbacks = document.getElementsByClassName(formType + "Feedback");
	for (let i = 0; i < feedbacks.length; i++)
	{
		feedbacks[i].style.display = "none";
	}

	document.getElementById(formType + "Err").style.display = "none";
	
	// Reset input fields and close the modal.
	document.getElementById(formType + "Form").reset();
	closeModalForm(formType + "Modal", formType + "Form");
}

// Close a modal for adding or updating contacts.
function closeModalForm(modalId, formId)
{
	// If the modal is open, hide it.
	let modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
	if (modal)
	{
		modal.hide();
	}
}

function searchContacts()
{
	// Clear the "no results found" text.
	clearError();

	const srch = document.getElementById("searchText").value.toLowerCase();
	const terms = srch.split(" ");

	let contacts = document.getElementById("page" + pgNum).getElementsByTagName("tr");
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

	if(!matchFound)
	{
		document.getElementById("noResultsTxt").style.display = "";
	}
}

// Displays all contacts and clears search text field.
function clearSearch()
{
	clearError();
	let contacts = document.getElementById("page" + pgNum).getElementsByTagName("tr");
	for (let i = 0; i < contacts.length; i++)
	{
		contacts[i].style.display = "";
	}

	document.getElementById('searchText').value = '';

	if(contacts.length==0)
	{
		document.getElementById("noContactsTxt").style.display = "";
	}
}

//confirmDelete function
function confirmDelete(contactId, rowId) {
    console.log("Received Contact ID in confirmDelete:", contactId); // check contactID
    if (confirm("Are you sure you want to delete this contact?")) {
        deleteContact(contactId, rowId);
    }
}

//deleteContact function
function deleteContact(contactId, rowId) 
{
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
				document.getElementById("row" + rowId).remove();
                // displayContacts("");
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        console.error("Error in deleteContact: " + err.message);
    }
}

function clearError()
{
	document.getElementById("noResultsTxt").innerText = "No contacts found";
	document.getElementById("noResultsTxt").style.display = "none";
	document.getElementById("noContactsTxt").style.display = "none";
}