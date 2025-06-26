from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # セッション保持用

# 仮のログイン情報（ユーザー名: パスワード）
users = {
    "admin": "admin123",
    "user": "1234"
}

@app.route('/')
def home():
    if 'username' in session:
        return f"ようこそ {session['username']} さん！ <a href='/logout'>ログアウト</a>"
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        name = request.form['username']
        pw = request.form['password']
        if name in users and users[name] == pw:
            session['username'] = name
            return redirect(url_for('home'))
        return "ログイン失敗しました"
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
