import React, {useState} from "react";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebase";
import {useDispatch} from "react-redux";
import {loginUser, loginWithGoogle} from "../../redux/actionCreators/authActionCreators";


const Login = props => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const app = initializeApp(firebaseConfig);


    const googlePng = require('../../assets/images/google.png');

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginUser(email, password));
    }
    const handleWithGoogle = () => {
        dispatch(loginWithGoogle());
    };

    return (
        <div className="container">
            <div className="row mt-5">
                <div className="col-4"></div>
                <div className="col-4">
                    <form onSubmit={handleLogin}>
                        <div className="row mb-3">
                            <label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Email</label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="inputEmail3"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="row mb-3">
                            <label htmlFor="inputPassword3" className="col-sm-2 col-form-label">Password</label>
                            <div className="col-sm-10">
                                <input
                                    type="password"
                                    className="form-control"
                                    id="inputPassword3"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-outline-danger w-100">Giriş Yap</button>
                        <div className="row mt-3">
                            <div className="col-12">
                                <button type="button" className="btn btn-outline-primary w-100"
                                        onClick={handleWithGoogle}>
                                    <img src={googlePng} alt="sign with google" style={{width: 30, height: 30}}/>
                                    Google ile giriş yap
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="col-4"></div>
            </div>
        </div>
    );
}

export default Login;
