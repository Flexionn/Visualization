import csv
from datetime import datetime

data = [[[0 for _ in range(266)] for _ in range(24)] for _ in range(31)]

with open('novemebr_22.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        tpep_pickup_datetime = row['tpep_pickup_datetime']
        date = datetime.strptime(tpep_pickup_datetime, '%Y-%m-%d %H:%M:%S')
        day = date.day
        hour = int(str(date.hour).zfill(2))
        location_id = int(row['PULocationID'])

        if location_id > 265:
            print("Location_id higher than 265 with value " + str(location_id))

        if 1 <= day <= 30 and 0 <= hour <= 23 and 0 <= location_id <= 265:
            data[day][hour][location_id] += 1

output_file = 'tripcount_calculated.csv'
output_columns = ['Day', 'Hour', 'LocationID', 'Count']

with open(output_file, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(output_columns)

    for day in range(1, 31):
        for hour in range(24):
            for location_id in range(263):
                writer.writerow([str(day), str(hour), str(location_id)] + [str(data[day][hour][location_id])])
