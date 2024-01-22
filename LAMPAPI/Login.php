<?php

$inData = getRequestInfo();

$id = 0;
$firstName = "";
$lastName = "";

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    // Check user credentials and retrieve their ID
    $stmt = $conn->prepare("SELECT ID, firstName, lastName FROM Users WHERE Login=? AND Password =?");
    $stmt->bind_param("ss", $inData["login"], $inData["password"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if( $row = $result->fetch_assoc() )
    {
        // Get the user's ID
        $id = $row['ID'];
        
        // Query the Contacts table to retrieve all contacts associated with this user's ID
        $contacts = array();
        $stmt = $conn->prepare("SELECT ID, First_Name, Last_Name, Phone, Email FROM Contacts WHERE UserID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $contactsResult = $stmt->get_result();
        
        // Loop through the contacts and store them in an array
        while ($contactRow = $contactsResult->fetch_assoc()) {
            $contacts[] = $contactRow;
        }

        // Return user information and their associated contacts
        returnWithInfo($row['firstName'], $row['lastName'], $id, $contacts);
    }
    else
    {
        returnWithError("No Records Found");
    }

    $stmt->close();
    $conn->close();
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError( $err )
{
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}

function returnWithInfo( $firstName, $lastName, $id, $contacts )
{
    // Encode the user information and contacts into JSON
    $retValue = json_encode(array(
        "id" => $id,
        "firstName" => $firstName,
        "lastName" => $lastName,
        "contacts" => $contacts,
        "error" => ""
    ));
    
    sendResultInfoAsJson( $retValue );
}

?>
