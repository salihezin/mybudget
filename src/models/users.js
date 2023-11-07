const userModel = (email, name, uid) => {
    return {
        docs: [],
        email: email,
        image: null,
        name: name,
        uid: uid,

    };
};

export default userModel;
