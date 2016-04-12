from flask import current_app, Flask, render_template, redirect, url_for, request
import datadef
import actualdata

def create_app(debug=False, testing=False):
    app = Flask(__name__)
    
    app.debug = debug
    app.testing = testing
    
    @app.route("/")
    def index():
        return render_template("mainmap.html")

    @app.route("/dataview")
    def dataview():
        return render_template("dataview.html")
    @app.route("/data_def.json")
    def data_def_json():
        import json
        
        all = datadef.getAllDataDefs()
        
        return json.dumps(all, ensure_ascii=False)

    @app.route("/data.json")
    def data2_json():
        import json
        
        all = actualdata.selectAllDatapoints()
        
        return json.dumps(all, ensure_ascii=False)
        
    @app.route("/refresh_data_def")
    def refresh_data_def():    
        datadef.importDataDefs()
        
        return data_def_json()
    
    @app.route("/refresh_data")
    def refresh_data():
        actualdata.importData()
         
        return data2_json()
    
    @app.errorhandler(500)
    def server_error(e):
        return """
        An internal error occurred: <pre>{}</pre>
        See logs for full stacktrace.
        """.format(e), 500
    
    return app