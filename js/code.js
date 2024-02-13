const urlBase = 'http://cop4331groupss.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

const contactsPerPage = 10;
let pgNum = 0; // Current page number.

const cid = []; // All contact ids displayed.
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
}

// Login, register, and logout functions.

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	const login = document.getElementById("loginName").value;
	const password = document.getElementById("loginPassword").value;
	const hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	const tmp = {login:login,password:hash};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "Username/Password combination incorrect";
					document.getElementById("loginResultDiv").style.display = "";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				// Hide the error message.
				document.getElementById("loginResultDiv").style.display = "none";
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
    
    const login = document.getElementById("registerName").value;

	//makes sure password is valid
	if(!validPassword(document.getElementById("registerPassword").value, document.getElementById("confirmPassword").value))
	{
    	document.getElementById("registerResult").innerHTML = "Password is invalid";
	}

	else
	{
    	const password = document.getElementById("registerPassword").value;
		const hash = md5( password );

    	document.getElementById("registerResult").innerHTML = "";

    	const tmp = {firstName:firstName,lastName:lastName,login:login,password:hash};
    	const jsonPayload = JSON.stringify( tmp );
		console.log(jsonPayload);

    
    	const url = urlBase + '/Register.' + extension;

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
						document.getElementById("registerResultDiv").style.display = "";
            	    	return;
            		}

            		else if (this.status == 200)
            		{
                		const jsonObject = JSON.parse( xhr.responseText );
              	  		userId = jsonObject.id;
        
                		firstName = jsonObject.firstName;
                		lastName = jsonObject.lastName;

                		saveCookie();
						document.getElementById("registerResultDiv").style.display = "none";
                		window.location.href = "contact.html";
            		}

					//handles other possible errors
					else
					{
						document.getElementById("registerResult").innerHTML = "An unexpected error has occurred. Status code: " + this.status;
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

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// Login / Register forms and validation.

function passwordVisToggle(inputField, eyeIcon)
{
	eyeIcon.addEventListener("click", function(){
		this.classList.toggle("fa-eye-slash");
		const type = inputField.getAttribute("type") === "password" ? "text" : "password";
		inputField.setAttribute("type", type);
	  });
}

//at least 8 characters, at least one lowercase letter, at least one uppercase letter, at least one digit
function validPassword(input, matchInput)
{
	let valid=true;

	if(input.length < 8)
	{
		togglePassReq(false, "char8Warning", "char8Check", "char8Txt");
		valid = false;
	}
	else
	{
		togglePassReq(true, "char8Warning", "char8Check", "char8Txt");
	}

	if(!/[a-z]/.test(input))
	{
		togglePassReq(false, "lowerWarning", "lowerCheck", "lowerTxt");
		valid = false;
	}
	else
	{
		togglePassReq(true, "lowerWarning", "lowerCheck", "lowerTxt");
	}

	if(!/[A-Z]/.test(input))
	{
		togglePassReq(false, "upperWarning", "upperCheck", "upperTxt");
		valid = false;
	}
	else
	{
		togglePassReq(true, "upperWarning", "upperCheck", "upperTxt");
	}

	if(!/\d/.test(input))
	{
		togglePassReq(false, "digitWarning", "digitCheck", "digitTxt");
		valid = false;
	}
	else
	{
		togglePassReq(true, "digitWarning", "digitCheck", "digitTxt");
	}

	if (!matchesPassword(input, matchInput))
	{
		valid = false;
	}

	return valid;
}

// Checks if two passwords match.
function matchesPassword(input, matchInput)
{
	if (input != matchInput || input.length < 1)
	{
		togglePassReq(false, "matchInputWarning", "matchInputCheck", "matchInputTxt");
		return false;
	}
	else
	{
		togglePassReq(true, "matchInputWarning", "matchInputCheck", "matchInputTxt");
		return true;
	}
}

// Toggles display of password requirement depending on validity.
function togglePassReq(valid, warningIconId, checkIconId, txtId)
{
	const red = "#dc3545";
	const green = "#198754";
	document.getElementById(warningIconId).style.display = valid ? "none" : "";
	document.getElementById(checkIconId).style.display = valid ? "" : "none";
	document.getElementById(txtId).style.color = valid ? green : red;
}

// Toggle contacts display error when the search/load API returns an error.
function displayContactsErr(errMsg)
{
	const errDisplay = document.getElementById("noContactsTxt");
	errDisplay.innerHTML = errMsg;
	errDisplay.style.display = "";

	document.getElementById("contactsDisplay").style.display = "none";
	document.getElementById("paginationDiv").style.display = "none";
}

// CRUD operations.

// Adds a new contact to the top of the current page.
function addContact()
{
	const newFname = document.getElementById("addFname").value;
	const newLname = document.getElementById("addLname").value;
	const newphoneNum = document.getElementById("addPhNum").value;
	const newEmail = document.getElementById("addEmail").value;

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
				const jsonObject = JSON.parse(xhr.responseText);
				if (jsonObject.error)
				{
					console.log(jsonObject.error);

					// Display the error message.
					document.getElementById("addErrMsg").innerHTML = jsonObject.error;
					document.getElementById("addErr").style.display = "";

					// Make all the fields red and display warning icons.
					const inputs = document.getElementsByClassName("addInput");
					const icons = document.getElementsByClassName("addInvalidIcon");
					for (let i = 0; i < inputs.length; i++)
					{
						inputs[i].style.borderColor = "#dc3545";
						icons[i].style.display = "";
					}

					return;
				}

				// Create new table row with new contact information.
				const newContact = generateContact(newFname, newLname, newphoneNum, newEmail, jsonObject.contactId);

				// If this is the user's first contact, create their first page.
				const pages = document.getElementsByClassName("contactsBody");
				const pageAdding = (pages.length < 1) ? generatePage(pgNum) : document.getElementById("page" + pgNum);

				// Insert new contact at the top.
				pageAdding.insertBefore(newContact, pageAdding.firstChild)

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
		document.getElementById("contactErrTxt").innerText = "Error adding contact: " + err.message;
	}
}

// Wrapper funciton for searching.
function searchButton(srchTerm)
{
	nukeAllPages();
	searchContacts(srchTerm);

	const allDigits = /^[0-9]+$/;
	const digitsDashes = /^[0-9]{3}\-[0-9]*([0-9]|\-)*$/;

	if (allDigits.test(srchTerm))
	{
		searchContacts(formatPhoneNumber(srchTerm));
	}
	else if (digitsDashes.test(srchTerm))
	{
		searchContacts(srchTerm.replaceAll("-", ""));
	}
}

// Loads in the contacts matching a certain search term.
function searchContacts(srchTerm)
{
	const tmp = {
        search: srchTerm,
        userId: userId,
		size: contactsPerPage,
		page: (pgNum + 1)
    };

    const jsonPayload = JSON.stringify(tmp);
	
    const url = urlBase + '/SearchContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
					if (pgNum == 0)
					{
						// Trying to load from the beginning and found nothing.
						displayContactsErr("No contacts to display");
					}
                    return;
                }

				// If we're just starting out, make a new page to populate.
				let curPg;
				let pageOn = pgNum;
				if (pgNum == 0)
				{
					curPg = generatePage(pgNum + 1);
					pageOn = pgNum = pgNum + 1;
				}
				else
				{
					curPg = document.getElementById("page" + pgNum);
				}
				let switchPg = pgNum + 1; // Assume we want to switch the page.

				// Make a new page with each contact from the results.
				let contactsAdded = 0;
				for (let i = 0; i < jsonObject.results.length; i++)
				{
					if (!cid.includes(jsonObject.results[i].ID))
					{
						const fn = jsonObject.results[i].FirstName;
						const ln = jsonObject.results[i].LastName;
						const ph = jsonObject.results[i].Phone;
						const em = jsonObject.results[i].Email;
						cid[i] = jsonObject.results[i].ID;

						const newEntry = generateContact(fn, ln, ph, em, cid[i]);
						while (!populatePage(curPg, newEntry))
						{
							// We don't want to switch if our first new entry is 
							// trying to fill up the current page.
							if (i == 0 && pageOn == pgNum)
							{
								switchPage = pageOn;
							}

							const nextPg = document.getElementById("page" + (pageOn+1));
							if (nextPg)
							{
								curPg = nextPg;
							}
							else
							{
								curPg = generatePage(pageOn + 1);
							}
							pageOn++;
						}
	
						contactsAdded++;
					}
				}

				// Hide the old page if it existed and was full before we started adding.
				if (pgNum > 1 && pgNum < switchPg)
				{
					document.getElementById("page" + (pgNum)).style.display = "none";
				}
				// Hide the newly generated page if we aren't ready to display it yet.
				else if (pgNum == switchPg && contactsAdded > 0)
				{
					curPg.style.display = "none";
				}

				// If we actually added contacts, 
				if (contactsAdded > 0)
				{
					document.getElementById("contacts").appendChild(curPg);
					pgNum = pageOn;
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err) 
	{
		// Displaying error message to the user instead of just logging to the console
		displayContactsErr("Error loading contacts: " + err.message);
		return false;
	}
}

// Updates the contact in the database and in the HTML table.
function updateContact(cx)
{
	const saveFname = document.getElementById("editFname").value;
	const saveLname = document.getElementById("editLname").value;
	const savephoneNum = document.getElementById("editPhNum").value;
	const saveEmail = document.getElementById("editEmail").value;

	const tmp = {
		contactId: cid[cx],
		firstName: saveFname,
		lastName: saveLname,
		phone: savephoneNum,
		email: saveEmail,
		userId: userId
	};
	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/UpdateContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse(xhr.responseText);
				if (jsonObject.error)
				{
					console.log(jsonObject.error);

					// Display the error message.
					document.getElementById("editErrMsg").innerHTML = jsonObject.error;
					document.getElementById("editErr").style.display = "";

					// Make all the fields red and display warning icons.
					const inputs = document.getElementsByClassName("editInput");
					const icons = document.getElementsByClassName("editInvalidIcon");
					for (let i = 0; i < inputs.length; i++)
					{
						inputs[i].style.borderColor = "#dc3545";
						icons[i].style.display = "";
					}

					return;
				}

				//Modify contact info in table row and closes edit modal if valid
				const contactRow = document.getElementById("row" + cx);
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
		document.getElementById("contactErrTxt").innerText = "Error updating contact: " + err.message;
	}	
}

// Deletes the specified contact from the database.
function deleteContact(contactId, rowId) 
{
    const tmp = { contactId: contactId };
    const jsonPayload = JSON.stringify(tmp);

    console.log("Sending payload to DeleteContact:", jsonPayload); // Check what's happening

    const url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been deleted");
				document.getElementById("row" + rowId).remove();
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
		// todo display this
        console.error("Error in deleteContact: " + err.message);
    }
}

// CRUD helper functions.

// Generates a new page as the child of the contacts table.
function generatePage(pgNum)
{
	// Make a table body element with the correct attributes.
	const tbodyPage = document.createElement("tbody");
	tbodyPage.id = "page" + pgNum;
	tbodyPage.className = "contactsBody";

	document.getElementById("contacts").appendChild(tbodyPage);
	return tbodyPage;
}

// Returns a DOM table row containing the provided contact information.
function generateContact(fn, ln, ph, em, id)
{
	lastContactIdx++;
	const trow = document.createElement("tr");
	trow.id = "row" + lastContactIdx;
	trow.className = "contact";
	
	// Generate random profile picture.
	const imgNum = Math.floor(Math.random() * amtImages) + 1;
	const tdImage = document.createElement("td");
	tdImage.className = "align-middle contactIconArea";
	tdImage.innerHTML = "<img src=\'images/contactIcons/contactIcon" + imgNum + ".png\' alt=\'Random profile picture\' class=\'icons float-start\'>";
	trow.appendChild(tdImage);

	// Contact information.
	const contactData = [fn, ln, ph, em];
	const contactDataIdTemplates = ["fname", "lname", "phone", "email"]
	for (let i = 0; i < contactData.length; i++)
	{
		const tdCell = document.createElement("td");
		tdCell.className = "align-middle ";
		tdCell.id = contactDataIdTemplates[i] + lastContactIdx;
		tdCell.innerHTML = contactData[i];
		trow.appendChild(tdCell);
	}

	// Edit and delete buttons.
	const tdEdit = document.createElement("td");
	tdEdit.className = "align-middle contactIconArea";
	let editInnerHtml = "<button class=\'btn contactBtns\' aria-label=\'Edit\' data-bs-toggle=\'modal\' data-bs-target=\'#editModal\' onclick=\'editContact(" +  lastContactIdx + ");\'>";
	editInnerHtml += "<span class=\'material-symbols-outlined\'>edit</span>";
	editInnerHtml += "</button>";
	tdEdit.innerHTML = editInnerHtml;
	trow.appendChild(tdEdit);

	const tdDel = document.createElement("td");
	tdDel.className = "align-middle contactIconArea";
	let delInnerHTML = "<button class=\'btn contactBtns\' aria-label=\'Delete\' onclick='confirmDelete(" + id + ", " + lastContactIdx + ");'>";
	delInnerHTML += "<span class=\'material-symbols-outlined\'>delete</span>";
	delInnerHTML += "</button>";
	tdDel.innerHTML = delInnerHTML;
	trow.appendChild(tdDel);

	// Update the contact ids array with the new id.
	cid[lastContactIdx] = id; 

	return trow;
}

// Adds a contact to a specified page unless its full.
function populatePage(page, contact)
{
	const pageCapacity = contactsPerPage - page.getElementsByClassName("contact").length;
	if (pageCapacity > 0)
	{
		page.appendChild(contact);
		return true;
	}

	return false;
}

// Clears error messages from searching or loading.
function clearError()
{
	const errDisplay = document.getElementById("noContactsTxt");
	errDisplay.innerHTML = "";
	errDisplay.style.display = "none";

	document.getElementById("contactsDisplay").style.display = "";
	document.getElementById("paginationDiv").style.display = "";
}

// Resets displayed pages to prepare for search or search clear.
function nukeAllPages()
{
	clearError();
	const pagesDisplayed = document.getElementsByClassName("contactsBody");
	for (let i = 0; i < pagesDisplayed.length; i++)
	{
		pagesDisplayed[i].remove();
	}

	// Reset necessary globals.
	pgNum = 0;
	cid.length = 0;
	lastContactIdx = -1;
}

// Contact validation tied to modal submit button.
function updateSubmit(cx) {
	if(validateContactForm('edit', 'editFname', 'editPhNum', 'editEmail')) 
	{
	  updateContact(cx); 
	}
}

//Copies current contact info into edit modal
function editContact(cx)
{
	//Get current contact info
	const currFname = document.getElementById("fname" + cx).innerText;
	const currLname = document.getElementById("lname" + cx).innerText;
	const currPhNum = document.getElementById("phone" + cx).innerText;
	const currEmail = document.getElementById("email" + cx).innerText;
	
	//Put contact info in fields 
	document.getElementById('editFname').setAttribute("value", currFname);
	document.getElementById('editLname').setAttribute("value", currLname);
	document.getElementById('editPhNum').setAttribute("value", currPhNum);
	document.getElementById('editEmail').setAttribute("value", currEmail);

	//Update contact 
	document.getElementById('updateButton').setAttribute("onclick", "javascript: updateSubmit(" + cx + ");");
}

// Prompts the user to confirm contact deletion.
function confirmDelete(contactId, rowId) 
{
	// Get the first and last names of the contact to delete.
	let names = document.getElementById("fname" + rowId).innerText;
	names += " " + document.getElementById("lname" + rowId).innerText;
    if (confirm("Are you sure you want to delete " + names + "'s contact?"))
	{
        deleteContact(contactId, rowId);
    }
}

// CRUD form validation / form and error resets.

// Validates the add/update forms.
function validateContactForm(formType, fnameId, phoneId, emailId)
{
	let fnameErr = lnameErr = phoneErr = emailErr = false;

	// Get inputs.
	const fname = document.getElementById(fnameId);
	const phone = document.getElementById(phoneId);
	const email = document.getElementById(emailId);


	if (!fname.value)
	{
		fname.style.borderColor = "#dc3545";
		document.getElementById(formType + "FnameInvalid").style.display = "";
		document.getElementById(formType + "FnameFeedback").style.display = "";
		fnameErr = true;
	}

	// Validate the phone number.
	const phoneNum = phone.value;
	const phRegex = /^[(]?[0-9]{3}[)]?[-\.]?[0-9]{3}[-\.]?[0-9]{4}$/;
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
	const emailRegex = /^[a-zA-Z0-9!#\$%&'\*\+\-\/=\?\^_`\{|\}~.]+@[a-z]+\.[a-z]+$/;
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

// Reset the add or update form.
function resetForm(formType)
{
	// Revert invalid or error styling.
	const invIcons = document.getElementsByClassName(formType + "InvalidIcon");
	const inputs = document.getElementsByClassName(formType + "Input");
	if (invIcons && inputs)
	{
		for (let i = 0; i < invIcons.length; i++)
		{
			invIcons[i].style.display = "none";
			inputs[i].style.borderColor = "black";
		}
	}

	const feedbacks = document.getElementsByClassName(formType + "Feedback");
	if (feedbacks)
	{
		for (let i = 0; i < feedbacks.length; i++)
		{
			feedbacks[i].style.display = "none";
		}
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
	const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
	if (modal)
	{
		modal.hide();
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

// Other controls: clearing search and navigating between pages.

// Displays all contacts and clears search text field.
function clearSearch()
{
	nukeAllPages();
	document.getElementById("searchText").value = "";
	searchContacts(""); // Search with empty string.
}

// Go to the next or previous page based on the increment.
function changePage(pageIncr)
{
	const pages = document.getElementsByClassName("contactsBody");

	// If the page to turn to has not been loaded yet.
	if (pgNum + pageIncr > pages.length)
	{
		searchContacts("");
	}
	else if (pgNum + pageIncr > 0)
	{
		// Hide current page and update the global page tracker.
		document.getElementById("page" + pgNum).style.display = "none";

		// Display the next or prev page.
		pgNum += pageIncr;
		document.getElementById("page" + pgNum).style.display = "";
	}
}

// Cookies

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
	for(let i = 0; i < splits.length; i++) 
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
