from gcloud import datastore

client = datastore.Client("socialmapkorea")

def selectAll(kind, order=None):
    query = client.query(kind=kind)
    if order: query.order = order

    resultlist = list(query.fetch())
            
    return resultlist

def deleteAll(kind):
    all = selectAll(kind)
    keylist = list(map(lambda x: x.key, all))
    client.delete_multi(keylist)
    
def importDataDef():
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    
    scope = ['https://spreadsheets.google.com/feeds']
    
    credentials = ServiceAccountCredentials.from_json_keyfile_name('socialmapkorea-credentials.json', scope)
    
    gc = gspread.authorize(credentials)
    
    wks = gc.open("socialmapkorea_data").sheet1
    
    code_list = list(filter(lambda x: len(x)>0, wks.col_values(1)))
    name_list = list(filter(lambda x: len(x)>0, wks.col_values(2)))
    name_list_u = list(map(lambda x: x, name_list))
    data_def_list = list(map(lambda x,y: [x,y], code_list, name_list_u))
    
    deleteAll('Data_Def')
    
    with client.transaction():
        incomplete_keys = client.key('Data_Def')
        for item in data_def_list:
            print(str(item))
            datadefEntity = datastore.Entity(key=incomplete_keys)
            datadefEntity.update({
                                  'code': item[0],
                                  'name': item[1]})
            client.put(datadefEntity)
            print(datadefEntity.key) 
    
# importDataDef()

print (str(selectAll('Data_Def', order='code')))