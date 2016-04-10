import os
from gcloud import datastore

def selectAll(client, kind, order=None):
    query = client.query(kind=kind)
    if order: query.order = order

    resultlist = list(query.fetch())
            
    return resultlist

def deleteAll(client, kind):
    all = selectAll(client, kind)
    keylist = list(map(lambda x: x.key, all))
    client.delete_multi(keylist)

def fetchDataDefs():
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('socialmapkorea-credentials.json', scope)
    gc = gspread.authorize(credentials)
    wks = gc.open("socialmapkorea_data").sheet1
    
    code_list = list(filter(lambda x: len(x)>0, wks.col_values(1)))
    name_list = list(filter(lambda x: len(x)>0, wks.col_values(2)))
    data_def_list = list(map(lambda x,y: [x,y], code_list, name_list))

    return data_def_list

# -------------------------------------------------

def importDataDefs():
    client = datastore.Client(os.environ['GCLOUD_PROJECT'])
    
    deleteAll(client, 'Data_Def')
    data_def_list = fetchDataDefs()
    
    with client.transaction():
        incomplete_keys = client.key('Data_Def')
        for item in data_def_list:
            if item[0] != u'data_code':
                datadefEntity = datastore.Entity(key=incomplete_keys)
                datadefEntity.update({
                                      'code': item[0],
                                      'name': item[1]})
                client.put(datadefEntity)

def getAllDataDefs():
    client = datastore.Client(os.environ['GCLOUD_PROJECT'])
    all = selectAll(client, kind='Data_Def', order='code')
    allc = list(map(lambda x: {'code': x[u'code'].encode("utf-8"), 'name': x[u'name'].encode("utf-8")}, all))
    return allc