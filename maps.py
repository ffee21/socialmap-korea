from flask import current_app, Flask, render_template, redirect, url_for

def create_app(debug=False, testing=False):
    app = Flask(__name__)
    
    app.debug = debug
    app.testing = testing
    
    @app.route("/")
    def index():
        return render_template("mainmap.html")
        
    @app.route("/data_def.csv")
    def data_def_csv():
        return render_template("data_def.csv")
    
    @app.route("/data.csv")
    def data_csv():
        return render_template("data.csv")
    
    @app.errorhandler(500)
    def server_error(e):
        return """
        An internal error occurred: <pre>{}</pre>
        See logs for full stacktrace.
        """.format(e), 500
    
    return app