import pandas as pd
import json
import sklearn
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

def compute_pca(filters):
    accidents_data = pd.read_csv("./static/data/london_accidents.csv")
    boroughs =  open('./static/data/london_boroughs.json')

    print(filters)
    
    data = json.load(boroughs)

    boroughs_size_array = []
    
    for i in data['features']:
        boroughs_size_array.append([i["properties"]["code"], i["properties"]["area_hectares"], i["properties"]["name"]])

    boroughs_size_df = pd.DataFrame(boroughs_size_array, columns = ['Local_Authority_Highway', 'size', 'name'])

    boroughs.close()

    def getHour(row):
        return int(row.split(':')[0])

    # parse data

    accidents_data['Date'] = pd.to_datetime(accidents_data['Date'], format='%d/%m/%Y')
    accidents_data['weekday'] = accidents_data['Date'].dt.dayofweek
    accidents_data['month'] = accidents_data['Date'].dt.month - 1
    accidents_data['hour'] = accidents_data['Time'].apply(getHour)

    # parse filters

    def jsdate_to_python(dates):
        final_dates = []
        for i in dates:
            string_date = i.split("T")[0]
            final_dates.append(pd.to_datetime(string_date, format='%Y-%m-%d'))
        return final_dates

    filters["speedlimit"] = map(int, filters["speedlimit"])
    filters["light-cond"] = map(int, filters["light-cond"])
    filters["weather"] = map(int, filters["weather"])
    filters["timerange"] = jsdate_to_python(filters["timerange"])

    print(filters["timerange"])

    print(accidents_data.dtypes)

    accidents_data = accidents_data[accidents_data['Local_Authority_Highway'].isin(filters["boroughs"])]
    accidents_data = accidents_data[accidents_data['weekday'].isin(filters["weekday"])]
    accidents_data = accidents_data[accidents_data['hour'].isin(filters["hour"])]
    accidents_data = accidents_data[accidents_data['month'].isin(filters["month"])]
    accidents_data = accidents_data[accidents_data['Speed_limit'].isin(filters["speedlimit"])]
    accidents_data = accidents_data[accidents_data['Accident_Severity'] <= filters["fatal-only"]]
    accidents_data = accidents_data[accidents_data['Weather_Conditions'].isin(filters["weather"])]
    accidents_data = accidents_data[accidents_data['Light_Conditions'].isin(filters["light-cond"])]
    accidents_data = accidents_data[accidents_data['Date'] >= filters["timerange"][0]]
    accidents_data = accidents_data[accidents_data['Date'] <= filters["timerange"][1]]


    print(len(accidents_data))

    grouped = accidents_data.groupby('Local_Authority_Highway') \
                .agg({'Accident_Index':'size', 'Accident_Severity':'mean'}) \
                .rename(columns={'Accident_Index':'count','Accident_Severity':'average_accident_severity'}) \
                .reset_index()


    merged_df = grouped.merge(boroughs_size_df, how='left', on='Local_Authority_Highway')
    features = merged_df.loc[:, ['count', 'average_accident_severity', 'size']]

    print(merged_df)

    scaler = StandardScaler()
    scaler.fit(features)
    scaled_features = scaler.transform(features)

    pca = PCA(n_components=2)
    pca.fit(scaled_features)
    X = pca.transform(scaled_features)

    pca_df = pd.DataFrame(X, columns = ['dim1', 'dim2'])
    pca_df_tot = pd.concat([pca_df, merged_df.loc[:, ['Local_Authority_Highway', 'name']]], axis=1)
    filepath = './static/data/pca_updated.csv'
    pca_df_tot.to_csv(filepath, index=False)


#x,y = zip(*X)

#plt.scatter(x,y)
#plt.show()

