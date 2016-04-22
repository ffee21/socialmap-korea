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

def selectAllRegionDefs(db=None):
    if not db: db = connect()
    cursor = db.cursor()
    cursor.execute('SELECT baseyear, region_name, region_code FROM regiondefs')

    # Create a list of guestbook entries to render with the HTML.
    regiondeflist = [];
    for row in cursor.fetchall():
      regiondeflist.append({"baseyear": row[0].encode('utf-8'), "region_name": row[1].encode('utf-8'), "region_code": row[2].encode('utf-8')})

    db.close()
    
    return regiondeflist

def deleteAll(db=None):
    if not db: db = connect()
    cursor = db.cursor()
    
    cursor.execute("DELETE FROM regiondefs")
    db.commit()

def fetchDataFromGSheets():
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('socialmapkorea-credentials.json', scope)
    gc = gspread.authorize(credentials)
    wks = gc.open("socialmapkorea_data").get_worksheet(2)
    
    baseyear_list = list(filter(lambda x: len(x)>0, wks.col_values(1)))
    region_name_list = list(filter(lambda x: len(x)>0, wks.col_values(2)))
    region_code_list = list(filter(lambda x: len(x)>0, wks.col_values(3)))
    
    data_list = list(map(lambda x,y,z: [x,y,z], baseyear_list, region_name_list, region_code_list))

    return data_list

def insertAllRegionDefs(datalist, db=None):
    if not db: db = connect()
    
    datalist = list(filter(lambda x: x[0]!=u'baseyear', datalist))
    
    q = """INSERT INTO regiondefs (baseyear, region_name, region_code) VALUES (%s, %s, %s)"""
    cursor = db.cursor()
    
    try:
        cursor.executemany(q, datalist)
        db.commit()
    except:
        db.rollback()
        
# -------------------------------------------------

def importRegionDefs(db=None):
    if not db: db = connect()
    deleteAll(db)
    data_list = fetchDataFromGSheets()
    insertAllRegionDefs(data_list)
    
    return selectAllRegionDefs(db)
