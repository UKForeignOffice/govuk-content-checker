# Check the last updated dates of gov.uk content

1. Upload a .csv file with the paths you want checked
2. .csv must have a single column, with each row containing a path eg /foreign-travel-advice/spain, <strong>not</strong> a full URL like https://www.gov.uk/foreign-travel-advice/spain
3. don't add a header row in the .csv, ie the first row should contain an actual path, not a title like 'Path'

After the file is uploaded, click Continue and a results .csv will be downloaded.

If any of the paths in the .csv were invalid, the corresponding row in the results will have the label 'error'.

## Dependencies
The app hits the [gov.uk Content API](https://content-api.publishing.service.gov.uk/) which is open and unauthenticated, and can also be used in a browser, eg - (https://www.gov.uk/api/content/bring-pet-to-great-britain)
