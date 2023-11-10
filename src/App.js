import React, {createRef, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import {initializeApp} from "firebase/app";
import {getDatabase, onValue, push, update, remove, ref} from "firebase/database";
import moment from "moment";
import {firebaseConfig} from "./config/firebase";
import Login from "./components/user/login";
import {useDispatch, useSelector} from "react-redux";
import {getUser, logoutUser} from "./redux/actionCreators/authActionCreators";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import 'moment/locale/tr';
import {Controller, useForm} from "react-hook-form";
import Chart from 'chart.js/auto';

const App = () => {
    console.log("git_test");
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [loggedUser, setLoggedUser] = useState(null);
    const [userId, setUserId] = useState('null');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isUpdateExpenseModalOpen, setIsUpdateExpenseModalOpen] = useState(false);
    const [isUpdateIncomeModalOpen, setIsUpdateIncomeModalOpen] = useState(false);
    const [showExpenseAlert, setShowExpenseAlert] = useState(false);
    const [showIncomeAlert, setShowIncomeAlert] = useState(false);
    const [formData, setFormData] = useState(null);
    const [fetchedData, setFetchedData] = useState([]);
    const [monthlyTotal, setMonthlyTotal] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const realTimeRef = ref(database, userId || 'null');
    const {control, register, handleSubmit} = useForm();

    const chartRef = createRef();

    //Login Status
    useEffect(() => {
        if (!isLoggedIn) {
            dispatch(getUser());
        }
        if (authState?.user) {
            setLoggedUser(authState.user.data);
        }
    }, [dispatch, authState]);

    //User Id
    useEffect(() => {
        if (loggedUser) {
            setUserId(loggedUser.uid);
        }
    }, [loggedUser]);

    //Alerts
    useEffect(() => {
        if (showExpenseAlert) {
            setTimeout(() => {
                setShowExpenseAlert(false);
            }, 5000);
        }
        if (showIncomeAlert) {
            setTimeout(() => {
                setShowIncomeAlert(false);
            }, 5000);
        }
    }, [showExpenseAlert, showIncomeAlert]);

    function fetchingFromFirebase(snapshot) {
        const temporaryData = [];
        const data = snapshot.val();

        if (data) {
            Object.keys(data).forEach((key) => {
                data[key].id = key;
                temporaryData.push(data[key]);
            });
        }

        // Verileri tarihe göre sırala
        temporaryData.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        //Verileri periyoda göre grupla ve aylık toplamı hesapla
        const monthlyTotalData = {};
        temporaryData.forEach((item, index) => {
            if (!monthlyTotalData[item.period]) {
                monthlyTotalData[item.period] = [];
            }
            monthlyTotalData[item.period].push(item);
        });

        const monthlyTotal = {};
        Object.keys(monthlyTotalData).forEach((key) => {
            monthlyTotal[key] = 0;
            monthlyTotalData[key].forEach((item) => {
                monthlyTotal[key] += item.amount;
            });
        });

        setMonthlyTotal(monthlyTotal);
        setFetchedData(temporaryData);
    }

    //Data Fetch
    useEffect(() => {
        try {
            onValue(realTimeRef, (snapshot) => {
                fetchingFromFirebase(snapshot);
            }, (error) => {
                console.error("The read failed: " + error.code);
            });
        } catch (error) {
            console.log(error);
        }
    }, [userId]);

    const setPeriods = () => {
        const periods = [];
        const today = moment();
        const currentMonth = today.format('MMMM YYYY');
        const firstHalf = today.date() < 15;

        for (let i = 0; i < 6; i++) {
            const month = moment(today).add(Math.floor(i / 2), 'months').format('MMMM YYYY');
            const period = `${month} - ${i % 2 === 0 ? 1 : 2}`;

            if (firstHalf && i === 0) {
                periods.push(currentMonth + ' - 1');
            } else if (!firstHalf && i === 5) {
                periods.push(month + ' - 1');
            } else {
                periods.push(period);
            }
        }

        return periods;
    }
    //Chart
    useEffect(() => {
        if (monthlyTotal) {
            Object.keys(monthlyTotal).forEach((key) => {
                if (!setPeriods().includes(key)) {
                    delete monthlyTotal[key];
                }
            });
        }
        if (chartRef.current) {
            // Destroy the existing chart if it exists
            if (chartRef.current.chart) {
                chartRef.current.chart.destroy();
            }

            // Grafiği oluşturmak için gerekli verileri burada tanımlayabilirsiniz.
            const data = {
                labels: setPeriods(),
                datasets: [
                    {
                        label: 'Gelir',
                        data: monthlyTotal,
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 4,
                        fill: false,
                    },
                ],
            };

            const config = {
                type: 'line', // Çizgi grafiği
                data: data,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            };

            // Grafiği çizin
            const ctx = chartRef.current.getContext('2d');
            chartRef.current.chart = new Chart(ctx, config);
        }
    }, [chartRef, monthlyTotal]);

    const getNavbar = () => {
        return (
            <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">Bütçem</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#"
                                   onClick={() => setIsExpenseModalOpen(true)}>
                                    Gider Ekle
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#"
                                   onClick={() => setIsIncomeModalOpen(true)}>
                                    Gelir Ekle
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="text-bg-dark">Merhaba {loggedUser?.displayName || loggedUser?.email}</div>
                    <div className="m-lg-3">
                        <a className="btn btn-outline-danger" onClick={() => dispatch(logoutUser())}>Çıkış Yap</a>
                    </div>
                </div>
            </nav>
        );
    };

    const renderExpenseAlert = () => {
        return (
            <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">İşlem Başarılı!</h4>
                <p>{formData?.explanation} isimli gideriniz {formData?.remain} taksit olarak kaydedildi.</p>
                <hr/>
                <p className="mb-0">Geri kalan taksitlerinizi de kaydedebilirsiniz.</p>
            </div>
        );
    }

    const renderIncomeAlert = () => {
        return (
            <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">İşlem Başarılı!</h4>
                <p>{formData?.explanation} isimli {formData.amount} tutarlı geliriniz kaydedildi.</p>
            </div>
        );
    }

    const onExpenseSubmit = item => {
        const {explanation, amount, period, remain, date} = item;
        for (let i = 0; i < parseInt(remain); i++) {
            const newDate = new Date(date);
            const setMonth = moment(newDate).add(i, 'months');
            push(realTimeRef, {
                explanation: explanation,
                amount: parseFloat(amount) * -1,
                period: setMonth.format('MMMM YYYY') + ' - ' + period,
                date: setMonth.toISOString(),
                isPaid: false,
            });
        }
        dismissAllModals();
        setShowExpenseAlert(true);
        setFormData(item);
    }

    const onIncomeSubmit = item => {
        const {explanation, amount, date, period} = item;
        const newDate = new Date(date);

        push(realTimeRef, {
            explanation: explanation,
            amount: parseFloat(amount),
            period: moment(newDate).format('MMMM YYYY') + ' - ' + period,
            date: date.toISOString(),
            isPaid: false,
        });
        dismissAllModals();
        setShowIncomeAlert(true);
        setFormData(item);
    }

    const onExpenseUpdateSubmit = item => {
        const {explanation, amount, date, period, id} = item;
        console.log('item***', item);
        /*try {
            update(ref(database, userId + '/' + id), {
                explanation: explanation,
                amount: parseFloat(amount) * -1,
                period: moment(date).format('MMMM YYYY') + ' - ' + period,
                date: date.toISOString(),
                isPaid: false,
            }).catch((error) => {
                console.log(error);
            });
            dismissAllModals();
        } catch (error) {
            console.log(error);
        }*/
    }

    const onIncomeUpdateSubmit = item => {
        const {explanation, amount, date, period, id} = item;
        try {
            update(ref(database, userId + '/' + id), {
                explanation: explanation,
                amount: parseFloat(amount),
                period: moment(date).format('MMMM YYYY') + ' - ' + period,
                date: date.toISOString(),
                isPaid: false,
            }).catch((error) => {
                console.log(error);
            });
            dismissAllModals();
        } catch (error) {
            console.log(error);
        }
    }

    const modalExplanationInputView = () => <div className="mb-3">
        <Controller
            name="explanation"
            control={control}
            render={({field}) => (
                <input type="text" className="form-control"
                       id="explanation"
                       placeholder="Açıklama"
                       value={field.value || selectedItem?.explanation}
                       onChange={field.onChange}
                />
            )}/>
    </div>;

    const modalAmountInputView = () => <div className="mb-3">
        <Controller
            name="amount"
            control={control}
            render={({field}) => (
                <input type="number"
                       step={0.01}
                       className="form-control"
                       id="amount"
                       placeholder="Tutar"
                       value={field.value ? parseFloat(field.value) : selectedItem?.amount}
                       onChange={field.onChange}
                />
            )}/>
    </div>;

    const modalDateView = () => <div className="mb-3">
        <Controller
            name="date"
            control={control}
            render={({field}) => (
                <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Ödeme Günü"
                    locale={tr}
                    value={moment(selectedItem?.date).format('DD/MM/YYYY')}
                />
            )}/>
    </div>;

    const setPeriodOnUpdate = () => {
        const period = selectedItem?.period?.split(' - ');
        if (period) {
            return period[1];
        } else {
            return '1';
        }
    }

    const modalPeriodSelectView = () => <div className="mb-3">
        <Controller
            name="period"
            control={control}
            render={({field}) => (
                <select className="form-select"
                        aria-label="Default select period"
                        id="period"
                        value={field.value || setPeriodOnUpdate()}
                        onChange={field.onChange}>
                    <option value="1">Ay Başı</option>
                    <option value="2">Ay Ortası</option>
                </select>
            )}/>
    </div>;

    const dismissAllModals = () => () => {
        setSelectedItem(null);
        setIsExpenseModalOpen(false);
        setIsIncomeModalOpen(false);
        setIsUpdateExpenseModalOpen(false);
        setIsUpdateIncomeModalOpen(false);
    };

    const modalButtonsView = () => <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={dismissAllModals()}>
            Vazgeç
        </button>
        <button type="submit" className="btn btn-primary">Kaydet</button>
    </div>;

    const openExpenseModal = () => {
        const modalInstallmentInputView = () => <div className="mb-3">
            <input type="number" className="form-control" id="remain"
                   placeholder="Kalan Taksit Sayısı"  {...register('remain', {
                required: true, min: 1
            })}/>
        </div>;

        return (
            <div className="modal show" style={{display: 'block'}} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Gider Bilgileri</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Kapat" onClick={dismissAllModals()}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(onExpenseSubmit)}>
                                {modalExplanationInputView()}
                                {modalAmountInputView()}
                                {modalPeriodSelectView()}
                                {modalInstallmentInputView()}
                                {modalDateView()}
                                {modalButtonsView()}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const openIncomeModal = () => {
        return <div className="modal show" style={{display: 'block'}} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Gelir Bilgileri</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"
                                aria-label="Kapat" onClick={dismissAllModals()}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit(onIncomeSubmit)}>
                            {modalExplanationInputView()}
                            {modalAmountInputView()}
                            {modalPeriodSelectView()}
                            {modalDateView()}
                            {modalButtonsView()}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    };

    const openUpdateExpenseModal = () => {
        return <div className="modal show" style={{display: 'block'}} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Gider Bilgileri</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"
                                aria-label="Kapat" onClick={dismissAllModals()}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit(onExpenseUpdateSubmit)}>
                            {modalExplanationInputView()}
                            {modalAmountInputView()}
                            {modalPeriodSelectView()}
                            {modalDateView()}
                            {modalButtonsView()}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }

    const openUpdateIncomeModal = () => {
        return <div className="modal show" style={{display: 'block'}} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Gelir Bilgileri</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"
                                aria-label="Kapat" onClick={dismissAllModals()}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit(onIncomeUpdateSubmit)}>
                            {modalExplanationInputView()}
                            {modalAmountInputView()}
                            {modalPeriodSelectView()}
                            {modalDateView()}
                            {modalButtonsView()}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    }

    const drawCanvas = () => <canvas ref={chartRef} id="myChart" width="400" height="200"></canvas>;

    const getListView = () => {
        const getItemView = () => {
            return (
                <>
                    {fetchedData?.map((item) => {
                        const collapseId = `collapse${item.id}`;
                        const isDiffLessFifteen = moment(item.date).diff(moment(), 'days') < 15;
                        const isDiffLessZero = moment(item.date).diff(moment(), 'days') <= 0;

                        const fifteenItemClass = () => isDiffLessFifteen ? 'list-group-item-warning' : 'list-group-item-primary';

                        const listItemClass = isDiffLessZero ? 'list-group-item-danger' : fifteenItemClass();

                        function setOnMinus() {
                            if (item.amount < 0) {
                                setIsUpdateExpenseModalOpen(true);
                                item.amount = item.amount * -1;
                            } else {
                                setIsUpdateIncomeModalOpen(true);
                            }
                            setSelectedItem(item);
                        }
                        return (
                            <div key={item.id}>
                                <a
                                    href="#"
                                    className={"list-group-item list-group-item-action " + listItemClass + " d-flex justify-content-between align-items-center} "}
                                    data-bs-toggle="collapse"
                                    data-bs-target={"#" + collapseId} aria-expanded="false"
                                    aria-controls={collapseId}
                                    style={{ color: item.amount < 0 ? 'red' : 'green' }}
                                >
                                    {moment(item.date).format('DD.MM.YYYY')} - {item.explanation} <span style={{ color: item.amount < 0 ? 'red' : 'green' }}>{item.amount.toLocaleString("tr", {minimumFractionDigits:2})} TL </span>
                                </a>
                                <div className="collapse" id={collapseId}>
                                    <div className="card card-body mt-3 mb-3">
                                        <div className="btn-group" role="group" aria-label="button options">
                                            <button type="button" className="btn btn-outline-warning"
                                                    onClick={() => setOnMinus()}>Güncelle
                                            </button>
                                            <button type="button" className="btn btn-outline-success">Ödendi</button>
                                            <button type="button" className="btn btn-outline-danger">Sil</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </>
            );
        };
        return <div className="list-group mt-3 mb-3">
            {getItemView()}
        </div>;
    };
    const bodyView = () => {
        const height = fetchedData?.length > 6 ? 'auto' : window.innerHeight;
        return (
            <div style={{width: '100%', height: height, display: 'flex', backgroundColor: 'black'}}>
                <div className="container-fluid">
                    {isExpenseModalOpen && openExpenseModal()}
                    {isIncomeModalOpen && openIncomeModal()}
                    {showExpenseAlert && renderExpenseAlert()}
                    {showIncomeAlert && renderIncomeAlert()}
                    {isUpdateExpenseModalOpen && openUpdateExpenseModal()}
                    {isUpdateIncomeModalOpen && openUpdateIncomeModal()}
                    <div className="row">
                        <div className="col-3"></div>
                        <div className="col-6">
                            {getNavbar()}
                            {drawCanvas()}
                            {getListView()}
                        </div>
                        <div className="col-3"></div>
                    </div>
                </div>
            </div>
        );
    };

    return isLoggedIn ? bodyView() : <Login/>;
}

export default App;

/*
Ödendi işaretleme yapıldı fonksyon eklenecek
Update ve delete işlemleri yapılacak
 */
