<?php

$inData = getRequestInfo();

$contactId = $inData["contactId"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Check if the contact with the given ID exists
    $stmt = $conn->prepare("SELECT * FROM Contacts WHERE ID=?");
    $stmt->bind_param("s", $contactId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Delete the contact with the given ID
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=?");
        $stmt->bind_param("s", $contactId);
        $stmt->execute();
        $stmt->close();
        $conn->close();
        returnWithError("");
    } else {
        returnWithError("Contact not found");
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