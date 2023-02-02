import pandas as pd
import json
import sklearn
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

def compute_pca(filters):
    accidents_data = pd.read_csv("./static/data/london_accidents.csv")
    boroughs =  open('./static/data/london_boroughs.json')
    
    data = json.load(boroughs)

    boroughs_size_array = []
    
    for i in data['features']:
        boroughs_size_array.append([i["properties"]["code"], i["properties"]["area_hectares"], i["properties"]["name"]])

    boroughs_size_df = pd.DataFrame(boroughs_size_array, columns = ['Local_Authority_Highway', 'size', 'name'])

    boroughs.close()

    def getHour(row):
        return row.split(':')[0]


    # parse dataframe
    accidents_data['Date'] = pd.to_datetime(accidents_data['Date'], format='%d/%m/%Y')
    accidents_data['weekday'] = accidents_data['Date'].dt.dayofweek
    accidents_data['month'] = accidents_data['Date'].dt.month - 1
    accidents_data['hour'] = accidents_data['Time'].apply(getHour)

    # parse filters



    accidents_data = accidents_data[accidents_data['Local_Authority_Highway'].isin(filters["boroughs"])]
    accidents_data = accidents_data[accidents_data['weekday'].isin(filters["weekday"])]
    accidents_data = accidents_data[accidents_data['hour'].isin(filters["hour"])]
    accidents_data = accidents_data[accidents_data['month'].isin(filters["month"])]
    accidents_data = accidents_data[accidents_data['month'] ]


    print(accidents_data.dtypes)
                  #"timerange": [],
                  #"speedlimit": [],
                  #"weather": [],
                  #"light-cond": []

    grouped = accidents_data.groupby('Local_Authority_Highway') \
                .agg({'Accident_Index':'size', 'Accident_Severity':'mean'}) \
                .rename(columns={'Accident_Index':'count','Accident_Severity':'average_accident_severity'}) \
                .reset_index()


    merged_df = grouped.merge(boroughs_size_df, how='left', on='Local_Authority_Highway')
    features = merged_df.loc[:, ['count', 'average_accident_severity', 'size']]

    scaler = StandardScaler()
    scaler.fit(features)
    scaled_features = scaler.transform(features)

    pca = PCA(n_components=2)
    pca.fit(scaled_features)
    X = pca.transform(scaled_features)

    pca_df = pd.DataFrame(X, columns = ['dim1', 'dim2'])
    pca_df_tot = pd.concat([pca_df, merged_df.loc[:, ['Local_Authority_Highway', 'name']]], axis=1)
    filepath = './static/data/pca_updated_test.csv'
    pca_df_tot.to_csv(filepath, index=False)


#x,y = zip(*X)

#plt.scatter(x,y)
#plt.show()

if __name__ == "__main__":
    filters = {'boroughs': ['E09000020', 'E09000033', 'E09000013', 'E09000001', 'E09000030', 'E09000028', 'E09000012', 'E09000019', 'E09000007', 'E09000022', 'E09000005', 'E09000014', 'E09000003', 'E09000009', 'E09000027', 'E09000031', 'E09000025', 'E09000017', 'E09000015', 'E09000018', 'E09000010', 'E09000026', 'E09000002', 'E09000016', 'E09000008', 'E09000032', 'E09000029', 'E09000023', 'E09000006', 'E09000011', 'E09000004', 'E09000021', 'E09000024'], 
               'hour': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 
               'weekday': [0, 1, 2, 3, 4, 5, 6], 
               'month': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 
               'timerange': ['2004-12-31T23:00:00.000Z', '2014-12-31T23:00:00.000Z'], 
               'fatal-only': 3, 
               'speedlimit': ['10', '15', '20', '30', '40', '50', '60', '70'],
               'weather': ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
               'light-cond': ['1', '4', '5', '6', '7']}
    compute_pca(filters)
