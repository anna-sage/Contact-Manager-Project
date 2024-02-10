<?php

$inData = getRequestInfo();

// Pagination Process
$perPage = 10; // we want 10 contacts for each page
$page = isset($inData['page']) ? $inData['page'] : 1;
$offset = ($page -1) * $perPage;

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

        //updated this piece of code below to handle pagination 
        $stmt = $conn->prepare("SELECT * FROM Contacts WHERE (First_Name LIKE ? OR Last_Name LIKE ? OR Phone LIKE ? OR Email LIKE ?) AND UserID = ? ORDER BY First_Name LIMIT ? OFFSET ?");

        //update code below to deal with LIMIT AND OFFSET
        $stmt->bind_param("sssssss", $searchTerm, $searchTerm, $searchTerm, $searchTerm, $userId, $perPage, $offset);
    } 

    $stmt->execute();

    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        if ($searchCount > 0) {
            $searchResults .= ",";
        }
        $searchCount++;
        $searchResults .= '{"ID":"' . $row["ID"] . '","FirstName":"' . $row["First_Name"] . '","LastName":"' . $row["Last_Name"] . '","Phone":"' . $row["Phone"] . '","Email":"' . $row["Email"] . '"}';
    }

    if ($searchCount == 0) {
        returnWithError("No Records Found");
    } else {
        returnWithInfo($searchResults, $searchCount);
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

function returnWithInfo($searchResults, $totalResults)
{
    //Modification done here to also deal with immplemenation of pagination 
    $retValue = '{"results":[' . $searchResults . '], "totalResults":' . $totalResults . ',"error":""}';
    sendResultInfoAsJson($retValue);
}
?>