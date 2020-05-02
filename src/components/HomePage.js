import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { getUser } from "../utilities/Common";
import InfiniteScroll from "react-infinite-scroller";
import "antd/dist/antd.css";

import { Layout, Menu, Avatar, Badge, Popover, Empty, List } from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  DollarOutlined,
  BellOutlined,
  NotificationOutlined,
  InfoCircleTwoTone,
  WarningTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

import Home from "./Home";
import Prijava from "./Prijava";
import PregledProfila from "./PregledProfila";
import DodaniRacuni from "./DodaniRacuni";
import DodavanjeRacuna from "./DodavanjeRacuna";
import PromjenaLozinke from "./PromjenaLozinke";
import TransakcijeMjesec from "./transactions/TransakcijeMjesec";
import TransakcijeMerchant from "./transactions/TransakcijeMerchant";
import OporavkaLozinke from "./OporavkaLozinke";
import SigurnosnoPitanje from "./SigurnosnoPitanje";
import PrikazNoveSifre from "./PrikazNoveSifre";
import RacunUspjeh from "./RacunUspjeh";
import Logout from "./Logout";
import NewPasswordAlert from "./NewPasswordAlert";
import PregledTransakcija from "./transactions/PregledTransakcija";
import BankAccTable from "./BankAccTable";
import TransakcijeIznos from "./transactions/TransakcijeIznos";
import TransakcijeBankovni from "./transactions/TransakcijeBankovni";
import Notifikacije from "./Notifikacije";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import axios from "axios";
import { getToken } from "../utilities/Common";

const { SubMenu } = Menu;
const { Header, Content, Sider, Footer } = Layout;

const SERVER_URL = "https://payment-server-si.herokuapp.com/websocket";
let stompClient;

function HomePage() {
  const [selectedMenuItem, setSelectedMenuItem] = useState("pocetna");
  const [notifications, setNotifications] = useState([
    // {
    //   message: "poruka",
    //   notificationDateAndTime: "2020-05-02 14:03:49",
    //   notificationId: "jsjsjsjsjssiij",
    //   notificationStatus: "INFO",
    //   notificationType: "MONEY_TRANSFER",
    //   subjectId: "idTransakcije",
    //   read: true,
    // },
  ]);
  const [count, setCount] = useState(0);

  const getUnreadNotifications = async () => {
    let res = await axios.get(
      "https://payment-server-si.herokuapp.com/api/notifications/unread",
      {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      }
    );
    setNotifications(res.data);
    setCount(res.data.length);
    console.log(notifications);
  };

  useEffect(() => {
    getUnreadNotifications();
    const socket = new SockJS(SERVER_URL);
    stompClient = Stomp.over(socket);
    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(
          "/queue/reply" + JSON.parse(getUser()).username,
          (msg) => {
            const data = JSON.parse(msg.body);
            setCount(count + 1);
            setNotifications([...data]);
            console.log({ response: data, count: count });
          }
        );
      },
      (err) => console.log(err)
    );
  }, []);

  const handleTransfer = (transfer) => {
    console.log(transfer);
    axios
      .get(
        "https://payment-server-si.herokuapp.com/api/notifications/specific/" +
          transfer.notificationId,
        {
          headers: { Authorization: "Bearer " + getToken() },
        }
      )
      .then(() => {
        getUnreadNotifications();
        console.log("preusmjeri");
      })
      .catch((err) => console.log(err));
  };
  const handleTransaction = (transaction) => {
    console.log(transaction);
  };
  const handleAccount = (account) => {
    console.log(account);
  };

  const checkType = (notification) => {
    if (notification.notificationStatus === "INFO")
      return <InfoCircleTwoTone twoToneColor="#41bdf2" />;
    else if (notification.notificationStatus === "WARNING")
      return <WarningTwoTone twoToneColor="#f0a800" />;
    else if (notification.notificationStatus === "ERROR")
      return <CloseCircleTwoTone twoToneColor="#f00000" />;
  };

  const content = () => {
    return (
      <div>
        <Link to="/notifikacije" style={{ color: "#030852" }}>
          See all notifications
        </Link>

        {notifications.length === 0 ? (
          <Empty description="No new notifications"></Empty>
        ) : (
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            useWindow={false}
            style={{
              overflow: "auto",
              padding: "8px 24px",
              height: "300px",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Link
                      onClick={() => {
                        if (item.notificationType === "MONEY_TRANSFER")
                          handleTransfer(item);
                        else if (item.notificationType === "TRANSACTION")
                          handleTransaction(item);
                        else if (item.notificationType === "ACCOUNT_BALANCE")
                          handleAccount(item);
                      }}
                      to="/notifikacije"
                    >
                      See more
                    </Link>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: "white" }}
                        icon={checkType(item)}
                      />
                    }
                    title={item.notificationDateAndTime}
                    description={item.message}
                  />
                </List.Item>
              )}
            />
          </InfiniteScroll>
        )}
      </div>
    );
  };

  return (
    <Router>
      <Layout height="100vh">
        <Header className="header">
          <div className="logo">
            <p style={{ color: "white" }}>Payment </p>
            <p style={{ color: "#597ef7" }}> Dashboard</p>
          </div>
          <div style={{ float: "right" }}>
            <Avatar
              style={{
                color: "white",
                backgroundColor: "#597ef7",
              }}
              className="avatar"
            >
              {JSON.parse(getUser()).firstName.charAt(0)}
            </Avatar>
            <Popover
              placement="bottomLeft"
              title="New notifications"
              content={content}
              trigger="click"
            >
              <Badge count={count} showZero style={{ marginRight: "18px" }}>
                <BellOutlined
                  style={{
                    color: "white",
                    fontSize: "20px",
                    paddingRight: "20px",
                  }}
                />
              </Badge>
            </Popover>
          </div>
        </Header>
        <Layout>
          <Sider width={200} className="site-layout-background">
            <Menu
              selectedKeys={selectedMenuItem}
              onClick={(e) => setSelectedMenuItem(e.key)}
              mode="inline"
              style={{ height: "100%", borderRight: 0 }}
            >
              <Menu.Item key="pocetna">
                <Link to="/pocetna"> Home</Link>
              </Menu.Item>

              <SubMenu
                key="sub1"
                title={
                  <span>
                    <UserOutlined />
                    Profile
                  </span>
                }
              >
                <Menu.Item key="pregledProfila">
                  <Link to="/pregledProfila"> View profile </Link>
                </Menu.Item>

                <Menu.Item key="promjenaLozinke">
                  <Link to="/promjenaLozinke">Change password </Link>
                </Menu.Item>
              </SubMenu>

              <SubMenu
                key="sub3"
                title={
                  <span>
                    <DollarOutlined />
                    Transactions
                  </span>
                }
              >
                <Menu.Item key="pregledTransakcija">
                  <Link to="/pregledTransakcija">All transactions</Link>
                </Menu.Item>
                <Menu.Item key="transakcijeMjesec">
                  <Link to="/transakcijeMjesec"> Spent in a year</Link>
                </Menu.Item>
                <Menu.Item key="transakcijeMerchant">
                  <Link to="/transakcijeMerchant">Spent on merchant</Link>
                </Menu.Item>
                <Menu.Item key="transakcijeIznos">
                  <Link to="/transakcijeIznos"> Spent by merchant</Link>
                </Menu.Item>
                <Menu.Item key="transakcijeBankovni">
                  <Link to="/transakcijeBankovni"> Spent by bank account</Link>
                </Menu.Item>
              </SubMenu>
              <SubMenu
                key="sub2"
                title={
                  <span>
                    <CreditCardOutlined />
                    My bank accounts
                  </span>
                }
              >
                <Menu.Item key="pregledRacuna">
                  <Link to="/pregledRacuna">Bank account details</Link>
                </Menu.Item>
                <Menu.Item key="dodaniRacuni">
                  <Link to="/dodaniRacuni"> View added accounts</Link>
                </Menu.Item>
                <Menu.Item key="dodavanjeRacuna">
                  <Link to="/dodavanjeRacuna"> Add new account</Link>
                </Menu.Item>
              </SubMenu>

              <Menu.Item key="notifikacije">
                <NotificationOutlined />
                <Link to="/notifikacije">Notifications</Link>
              </Menu.Item>

              <Menu.Item key="logout">
                <LogoutOutlined />
                <Link to="/logout">Log out</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: "0px 24px" }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                height: "100vh",
              }}
            >
              <Switch>
                <Route exact path="/" component={Home} />

                <Route path="/pregledProfila" component={PregledProfila} />

                <Route path="/promjenaLozinke" component={PromjenaLozinke} />

                <Route path="/pregledRacuna" component={BankAccTable} />

                <Route path="/dodaniRacuni" component={DodaniRacuni} />

                <Route path="/dodavanjeRacuna" component={DodavanjeRacuna} />

                <Route
                  path="/pregledTransakcija"
                  component={PregledTransakcija}
                />

                <Route
                  exact
                  path="/transakcijeMjesec"
                  component={TransakcijeMjesec}
                />
                <Route
                  exact
                  path="/transakcijeMerchant"
                  component={TransakcijeMerchant}
                />
                <Route
                  exact
                  path="/transakcijeIznos"
                  component={TransakcijeIznos}
                />
                <Route
                  exact
                  path="/transakcijeBankovni"
                  component={TransakcijeBankovni}
                />

                <Route path="/oporavkaLozinke" component={OporavkaLozinke} />

                <Route
                  path="/sigurnosnoPitanje"
                  component={SigurnosnoPitanje}
                />

                <Route path="/newPasswordAlert" component={NewPasswordAlert} />

                <Route path="/notifikacije" component={Notifikacije} />

                <Route path="/novaSifra" component={PrikazNoveSifre} />
                <Route path="/racunUspjeh" component={RacunUspjeh} />

                <Route path="/pocetna" component={Home} />
                <Route path="/logout" component={Logout} />
                <Route path="/prijava" component={Prijava} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
        <Footer style={{ textAlign: "center" }}>Payment Dashboard ©2020</Footer>
      </Layout>
    </Router>
  );
}

export default HomePage;
