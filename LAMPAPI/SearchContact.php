<?php

$inData = getRequestInfo();

$searchResults = "";
$searchCount = 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $searchTerm = "%" . $inData["search"] . "%";

    if (isset($inData["userId"])) {
        // Search for contacts of a specific user if userId is provided
        $userId = $inData["userId"];
        $stmt = $conn->prepare("SELECT * FROM Contacts WHERE (First_Name LIKE ? OR Last_Name LIKE ? OR Phone LIKE ? OR Email LIKE ?) AND UserID = ?");
        $stmt->bind_param("sssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm, $userId);
    } 

    $stmt->execute();

    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        if ($searchCount > 0) {
            $searchResults .= ",";
        }
        $searchCount++;
        $searchResults .= '{"FirstName":"' . $row["First_Name"] . '","LastName":"' . $row["Last_Name"] . '","Phone":"' . $row["Phone"] . '","Email":"' . $row["Email"] . '"}';
    }

    if ($searchCount == 0) {
        returnWithError("No Records Found");
    } else {
        returnWithInfo($searchResults);
    }

    $stmt->close();
    $conn->close();
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

function returnWithInfo($searchResults)
{
    $retValue = '{"results":[' . $searchResults . '],"error":""}';
    sendResultInfoAsJson($retValue);
}
?>