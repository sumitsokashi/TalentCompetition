import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Card } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc",

            },
            filter: {
                sortbyDate: "desc",
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            jobStatusFilterValue: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this
        this.loadData();

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
            this.setState({ loaderData })
        )

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        debugger;
        const link = "http://localhost:51689/listing/listing/getSortedEmployerJobs?" +
            "&activePage=" + this.state.activePage +
            "&showActive=" + this.state.filter.showActive +
            "&showClosed=" + this.state.filter.showClosed +
            "&showDraft=" + this.state.filter.showDraft +
            "&sortbyDate=" + this.state.filter.sortbyDate +
            "&showExpired=" + this.state.filter.showExpired +
            "&showUnexpired=" + this.state.filter.showUnexpired;
        const cookies = Cookies.get("talentAuthToken");
        $.ajax({
            url: link,
            headers: {
                Authorization: "Bearer " + cookies,
                "Content-Type": "application/json",
            },
            type: "GET",
            data: JSON.stringify(this.state.filter),
            success: (res) => {
                debugger;
                if (res.success) {
                    this.setState({
                        loadJobs: res.myJobs,
                        totalPages: Math.ceil(res.totalCount / res.pageSize),
                    });
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null);
                }
            }
        });
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    render() {

        const { loadJobs, activePage, totalPages } = this.state;
        const cardStyle = {
            width: "350px",
            height: "350px",
            border: "1px solid #007BFF",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "white",
        };

        const buttonStyle = {
            color: "#007BFF",
            border: "1px solid #007BFF",
            backgroundColor: "white",

        };
        const buttonContainerStyle = {
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '1px',
            marginLeft: '1px',
        };


        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <h1>List Of Jobs</h1>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        <Icon name="filter" />
                        <span style={{ marginLeft: "10px", fontWeight: "bold" }}>Filter:</span>
                        <Dropdown
                            name="job-status-filter"
                            placeholder="Choose filter"
                            selection
                            options={[
                                { key: 'active', text: 'Active', value: 'showActive' },
                                { key: 'closed', text: 'Closed', value: 'showClosed' },
                                { key: 'expired', text: 'Expired', value: 'showExpired' },
                            ]}
                            onChange={(event, data) => {
                                debugger;
                                let jobObject = {};
                                if (data.value === "showActive") {
                                    jobObject = {
                                        sortbyDate: this.state.filter.sortbyDate,
                                        showActive: true,
                                        showClosed: false,
                                        showDraft: true,
                                        showExpired: false,
                                        showUnexpired: true
                                    };
                                }
                                else if (data.value === "showExpired") {
                                    jobObject = {
                                        sortbyDate: this.state.filter.sortbyDate,
                                        showActive: true,
                                        showClosed: false,
                                        showDraft: true,
                                        showExpired: true,
                                        showUnexpired: false
                                    };
                                }
                                else if (data.value === "showClosed") {
                                    jobObject = {
                                        sortbyDate: this.state.filter.sortbyDate,
                                        showActive: false,
                                        showClosed: true,
                                        showDraft: true,
                                        showExpired: false,
                                        showUnexpired: true
                                    };
                                }
                                this.setState({ filter: jobObject }, function () {
                                    this.loadData();
                                });
                            }}
                            style={{ marginLeft: "10px" }}
                        />


                        <Icon name="calendar" style={{ marginLeft: "20px" }} />
                        <span style={{ marginLeft: "3px", fontWeight: "bold" }}>Sort by date:</span>
                        <Dropdown
                            name="job-sort-filter"
                            placeholder="Sort by"
                            selection
                            options={[
                                { key: 'newest', text: 'Newest First', value: 'desc' },
                                { key: 'oldest', text: 'Oldest First', value: 'asc' },
                            ]}
                            onChange={(event, data) => {
                                debugger;
                                // Update sorting state
                                const jobObject = {
                                    sortbyDate: data.value,
                                    showActive: this.state.filter.showActive,
                                    showClosed: this.state.filter.showClosed,
                                    showDraft: this.state.filter.showDraft,
                                    showExpired: this.state.filter.showExpired,
                                    showUnexpired: this.state.filter.showUnexpired
                                };
                                this.setState({ filter: jobObject }, () => {
                                    this.loadData();
                                });
                                //this.setState({ sortBy: { date: data.value } }, () => {
                                //    this.loadData(); // Reload data after updating sorting
                                //});
                            }}
                            style={{ marginLeft: "10px" }}
                        />
                    </div>
                    <div>

                    </div>
                    <Card.Group itemsPerRow={3}>
                        {loadJobs.length > 0 ? (
                            loadJobs.map((myjob123) => (

                                <Card key={myjob123.id} style={cardStyle}>
                                    <Card.Content>
                                        <Card.Header>{myjob123.title}</Card.Header>
                                        <Card.Meta>
                                            <span>
                                                Location: {`${myjob123.location.city}, ${myjob123.location.country}`}
                                            </span>
                                        </Card.Meta>
                                        <Card.Description>
                                            {myjob123.summary}
                                        </Card.Description>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div style={buttonContainerStyle}>
                                            <button size="mini" style={buttonStyle} >
                                                <Icon name="close" />
                                                Close
                                            </button>
                                            <button size="mini" style={buttonStyle}>
                                                <Icon name="edit" />
                                                Edit
                                            </button>
                                            <button size="mini" style={buttonStyle} >
                                                <Icon name="copy" />
                                                copy
                                            </button>
                                        </div>
                                        {console.log(myjob123)}
                                        {new Date(myjob123.expiryDate) < new Date() && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: "22px",
                                                    left: "10px",
                                                    backgroundColor: "red",
                                                    color: "white",
                                                    padding: "5px 10px",
                                                    borderRadius: "5px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Expired
                                            </div>
                                        )}
                                    </Card.Content>



                                </Card>
                            ))
                        ) : (
                            <p>No jobs found.</p>
                        )}
                    </Card.Group>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            activePage={this.state.activePage}
                            totalPages={this.state.totalPages}
                            onPageChange={(e, { activePage }) => {
                                this.setState({ activePage }, () => {
                                    this.loadData();
                                });
                            }}
                        />
                    </div>
                </div>
            </BodyWrapper>
        );
    }
}