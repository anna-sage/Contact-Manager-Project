<?php
$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phone = $inData["phone"];
$email = $inData["email"];
$userId = $inData["userId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Check if a contact with the same information already exists for the user
    $stmt = $conn->prepare("SELECT * FROM Contacts WHERE UserId = ? AND First_Name = ? AND Last_Name = ? AND Phone = ? AND Email = ?");
    $stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // A contact with the same information already exists
        returnWithError("Sorry! Another contact exists already with this name, email, and phone.");
    } else {
        // Insert the new contact
        $stmt = $conn->prepare("INSERT into Contacts (UserId, First_Name, Last_Name, Phone, Email) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);
        $stmt->execute();
        $contactId = $stmt->insert_id; // Get the ID of the just-added contact
        $stmt->close();
        $conn->close();

        // Return the contact ID as part of the response
        returnWithContactId($contactId);
    }
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithContactId($contactId)
{
    $retValue = '{"contactId":"' . $contactId . '","error":""}';
    sendResultInfoAsJson($retValue);
}
?>