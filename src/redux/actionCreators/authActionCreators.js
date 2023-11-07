import {RESET_USER, SET_USER} from "../constants";
import {auth} from "../../config/firebase";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup
} from "firebase/auth";

const setUser = (data) => ({
    type: SET_USER,
    payload: data,
});

const resetUser = () => ({
    type: RESET_USER,
});

export const registerUser =
    (email, password) =>
        (dispatch) => {
            createUserWithEmailAndPassword(auth, email, password)
                .then((user) => {
                    dispatch(loginUser(email, password));
                })
                .catch((err) => {
                    console.log(err);
                    if (err.code === "auth/email-already-in-use") {
                       console.log("That email address is already in use!");
                    }
                });
        };

export const loginUser =
    (email, password) =>
        (dispatch) => {
            signInWithEmailAndPassword(auth, email, password)
                .then(async (user) => {
                    const usr = user.user;
                })
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'auth/user-not-found':
                            alert('Böyle bir kullanıcı bulunamadı');
                            break;
                        case 'auth/invalid-user-credentials':
                            alert('Hatalı kullanıcı adı veya şifre girdiniz');
                            break;
                        case 'auth/invalid-email':
                            alert('Geçersiz bir email girdiniz');
                            break;
                        case 'auth/too-many-requests':
                            alert('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyiniz.');
                            break;
                        case 'auth/network-request-failed':
                            alert('İnternet bağlantınızı kontrol ediniz.');
                            break;
                        case 'auth/user-disabled':
                            alert('Kullanıcı hesabınız devre dışı bırakılmıştır.');
                            break;
                        case 'auth/wrong-password':
                            alert('Yanlış şifre girdiniz');
                            break;
                        default:
                            alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
                            break;
                    }
                });
        };

export const loginWithGoogle = () => (dispatch) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
        }).catch((error) => {
        console.log('Giriş hatası:', error);
    });
}


export const logoutUser = () => (dispatch) => {
    auth.signOut().then(() => {
        dispatch(resetUser());
    });
};


export const getUser = () => (dispatch) => {
    auth.onAuthStateChanged(function (user) {
        if (user) {
            dispatch(
                setUser({
                    userId: auth.currentUser.uid,
                    user: {data: auth.currentUser.providerData[0]},
                })
            );
        } else {
            dispatch(resetUser());
        }
    });
};
