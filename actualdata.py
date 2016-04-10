import os
import pymysql


def connect():
        # Define your production Cloud SQL instance information.
    _INSTANCE_NAME = 'socialmapkorea:db-gen2'

    if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
        db = pymysql.connect(unix_socket='/cloudsql/' + _INSTANCE_NAME, db='guestbook', user='root', password='abcd1234', charset='utf8', autocommit=False)
    else:
        db = pymysql.connect(host='104.197.126.137', port=3306, db='socialmapkorea', user='root', password='abcd1234', charset='utf8', autocommit=False)

    return db

def selectAllDatapoints(db=None):
    if not db: db = connect()
    cursor = db.cursor()
    cursor.execute('SELECT adm_code, data_code, datavalue FROM datapoints')

    # Create a list of guestbook entries to render with the HTML.
    datapointlist = [];
    for row in cursor.fetchall():
      datapointlist.append({"adm_code": row[0].encode('utf-8'), "data_code": row[1].encode('utf-8'), "value": row[2].encode('utf-8')})

    db.close()
    
    return datapointlist

def deleteAll(db=None):
    if not db: db = connect()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM datapoints")
    db.commit()

def fetchDataFromGSheets():
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('socialmapkorea-credentials.json', scope)
    gc = gspread.authorize(credentials)
    wks = gc.open("socialmapkorea_data").get_worksheet(1)
    
    adm_code_list = list(filter(lambda x: len(x)>0, wks.col_values(1)))
    data_code_list = list(filter(lambda x: len(x)>0, wks.col_values(2)))
    value_list = list(filter(lambda x: len(x)>0, wks.col_values(3)))
    
    data_list = list(map(lambda x,y,z: [x,y,z], adm_code_list, data_code_list, value_list))

    return data_list

def insertAllData(datalist, db=None):
    if not db: db = connect()
    
    datalist = list(filter(lambda x: x[0]!=u'adm_code', datalist))
    
    q = """INSERT INTO datapoints (adm_code, data_code, datavalue) VALUES (%s, %s, %s)"""
    cursor = db.cursor()
    
    try:
        cursor.executemany(q, datalist)
        db.commit()
    except:
        db.rollback()
        
# -------------------------------------------------

def importData(db=None):
    if not db: db = connect()
    deleteAll(db)
    data_list = fetchDataFromGSheets()
    insertAllData(data_list)
    
    return selectAllDatapoints(db)
