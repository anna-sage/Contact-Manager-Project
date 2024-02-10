<?php

$inData = getRequestInfo();

$contactId = $inData["contactId"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phone = $inData["phone"];
$email = $inData["email"];
$userId = $inData["userId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Check if the contact with the given ID exists, now also check with same email or phone
    $stmt = $conn->prepare("SELECT * FROM Contacts WHERE UserId = ? AND First_Name = ? AND Last_Name = ? AND Phone = ? AND Email = ?");
    $stmt->bind_param("sssss", $userId, $firstName, $lastName, $phone, $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0) {
        // when a duplicate is found, return error message
        returnWithError("Sorry! Another contact exists already with this name, email, and phone.");
    } else {
        // when no duplicates are found, update
        $stmt = $conn->prepare("UPDATE Contacts SET First_Name=?, Last_Name=?, Phone=?,Email=? WHERE ID=?");
        $stmt->bind_param("sssss", $firstName,$lastName,$phone,$email,$contactId);
        $stmt->execute();
        $stmt->close();
        $conn->close();
        returnWithError(""); //NO Error

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

?>