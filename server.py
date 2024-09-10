from flask import Flask, request, jsonify
from threp import THReplay
import os
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)


@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        file = request.files["replay"]
        save_path = os.path.join(os.path.dirname(__file__), file.filename)
        file.save(save_path)

        tr = THReplay(f"{save_path}")
        base_info = tr.getBaseInfoDic()
        stage_score = tr.getStageScore()
        player = tr.getPlayer()
        slow_rate = tr.getSlowRate()
        date = tr.getDate()
        rpy_name = file.filename

        os.remove(save_path)

        flat_response = {
            "player": player,
            "character": base_info['character'],
            "shotType": base_info['shottype'],
            "rank": base_info['rank'],
            "stage": base_info['stage'],
            "stageScore": stage_score,
            "slowRate": slow_rate,
            "date": date,
            "rpyName": rpy_name,
        }
        return jsonify(flat_response)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
