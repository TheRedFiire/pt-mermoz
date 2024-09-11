import pandas as pd
from collections import defaultdict
from datetime import datetime, timedelta
import json

# Chemin vers le fichier Excel
file_path = './public/documents/Coloscope.xlsx'

# Charger la feuille Excel
df = pd.read_excel(file_path, sheet_name='Feuille 1')

# Helper function to add one hour and convert the time format to HH:MM
def format_time(time_str):
    try:
        time_obj = datetime.strptime(time_str, "%Hh")
        return time_obj.strftime("%H:%M")
    except ValueError:
        return time_str

def add_one_hour_if_valid(time_str):
    try:
        time_obj = datetime.strptime(time_str, "%Hh")
        end_time = time_obj + timedelta(hours=1)
        return end_time.strftime("%H:%M")
    except ValueError:
        return time_str

# Dates des semaines
week_dates = {
    "S1-A": "2024-09-16",
    "S2-B": "2024-09-23",
    "S3-A": "2024-09-30",
    "S4-B": "2024-10-14",
    "S5-A": "2024-11-04",
    "S6-B": "2024-11-11",
    "S7-A": "2024-11-14",
    "S8-B": "2024-11-18",
    "S9-A": "2024-11-25",
    "S10-B": "2024-12-02",
    "S11-A": "2024-12-09",
    "S12-B": "2024-12-16",
    "S13-A": "2024-01-06",
    "S14-B": "2024-01-13"
}

# Create a dictionary to group colles by subject, grouping weeks, groups, and dates
colles_grouped_with_arrays = defaultdict(lambda: {
    "professor": "",
    "room": "",
    "color": "#36BA98",
    "day": "",
    "start": "",
    "end": "",
    "weeks": [],
    "groups": [],
    "dates": []
})

# List of weeks available in the dataframe (S1-A, S2-B, etc.)
week_columns = df.columns[4:]  # Skip first 4 columns which are static info

# Iterate through the data rows (excluding headers)
for index, row in df.iterrows():
    if index > 1:  # Skip the first two rows which are headers
        professor_info = row['Unnamed: 0']
        schedule = row['Unnamed: 1']
        group_available = row['Unnamed: 2']
        room = row['Unnamed: 3']
        
        # Process each week for the current row
        for week_col in week_columns:
            week_data = row[week_col]
            
            if pd.notna(week_data):
                # Extract start time and handle weeks
                start_time_raw = schedule.split(" ")[1]
                start_time = format_time(start_time_raw)
                day = schedule.split(" ")[0]
                end_time = add_one_hour_if_valid(start_time_raw)
                subject = professor_info.split("-")[0]
                
                # If the subject has no professor and room assigned yet, set them
                if not colles_grouped_with_arrays[subject]['professor']:
                    colles_grouped_with_arrays[subject]['professor'] = professor_info.split("-")[1]
                    colles_grouped_with_arrays[subject]['room'] = room
                    colles_grouped_with_arrays[subject]['day'] = day
                    colles_grouped_with_arrays[subject]['start'] = start_time
                    colles_grouped_with_arrays[subject]['end'] = end_time
                
                # Append the week, group, and date to the corresponding arrays
                colles_grouped_with_arrays[subject]['weeks'].append(week_col)
                colles_grouped_with_arrays[subject]['groups'].append(week_data)
                colles_grouped_with_arrays[subject]['dates'].append(week_dates.get(week_col, "Unknown date"))

# Convert the dictionary to a list for JSON format
optimized_colles_with_arrays = [
    {"subject": subject, **details} for subject, details in colles_grouped_with_arrays.items()
]

# Save the new optimized JSON file with arrays
json_file_with_arrays_path = './public/documents/colloscope_data.json'

with open(json_file_with_arrays_path, 'w') as json_file:
    json.dump(optimized_colles_with_arrays, json_file, indent=4)

print(f"JSON file saved to {json_file_with_arrays_path}")
