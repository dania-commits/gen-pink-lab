Foodora Fleet Associate demo

What this is
This is a small interactive demo that simulates rider payment quality checks and follow up workflows.
It is designed to show operational thinking, attention to detail, and data driven execution.

How to run
Option 1
Open index.html in your browser.

Option 2 recommended for best results
Use any local web server.
If you have Python installed, run this in the folder:
python -m http.server 8000
Then open:
http://localhost:8000

How to share as a link
Upload this folder to a GitHub repository and enable GitHub Pages.
Then paste the public link in your foodora application cover letter.

CSV format
rider_id,rider_name,work_date,hours_worked,hourly_rate,bonus,bank_details_ok,notes

Features
Loads sample data
Upload your own CSV
Computes payout
Flags missing or invalid fields
Flags duplicates for the same rider and day
Flags unusual hour outliers
Creates a follow up list with suggested actions
Exports a cleaned CSV for further processing
