import React from 'react';
import {
	Row,
	Col,
	Container,
	Alert
} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment';

import ExchangeSetting from './ExchangeSetting.jsx'
import ExchangeList from './ExchangeList.jsx'

export default class ExchangeListContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exchangeList: {},
			settingOpen: true,
			filter: null
		};

		this.db = window.firebase.database();
		this.handleSaveExchangeSetting = this.handleSaveExchangeSetting.bind(this);
		this.handleUnpublish = this.handleUnpublish.bind(this);
		this.handleToggleSetting = this.handleToggleSetting.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}

	componentDidMount() {
		this.getExchangeList();
	}

	getExchangeList() {
		this.db.ref('exchangeList/').once('value').then((snapshot) => {
			const data = snapshot.val() || {};
			this.setState({
				exchangeList: data
			});
		});
	}

	handleSaveExchangeSetting(have, want, desc) {
		const name = this.context.user.displayName;
		const fbid = this.context.user.uid;
		const uuid = this.context.user.uuid;
		const time = moment().format();
		this.db.ref(`exchangeList/${uuid}`).set(JSON.stringify({
			fbid, name, want, have, desc, time
		}))
		.then(() => {
			alert('已發佈');
			this.getExchangeList();
		});
	}

	handleUnpublish() {
		this.db.ref(`exchangeList/${this.context.user.uuid}`).remove().then(() => {
			this.getExchangeList();
		});
	}

	handleToggleSetting() {
		this.setState({
			settingOpen: !this.state.settingOpen
		});
	}

	handleFilter(keywords) {
		this.setState({
			filter: keywords
		});
	}

	render() {
		const containerStyle = {
			height: 'calc(100vh - 56px)',
			overflow: 'auto',
			background: '#fff'
		};

		const exchangeList = this.state.exchangeList;

		return (
			<div>
				{ this.context.user && !this.context.user.uid &&
					<Row>
						<Col xs="12">
							<Alert className="text-center mt-3" color="danger">請先登入</Alert>
						</Col>
					</Row>
				}

				{ this.context.user && this.context.user.uid &&
					<div>
						<ExchangeSetting
							exchangeList={this.state.exchangeList}
							settingOpen={this.state.settingOpen}
							onSave={this.handleSaveExchangeSetting}
							onUnpublish={this.handleUnpublish}
							onToggleSetting={this.handleToggleSetting}
							onFilter={this.handleFilter}
						/>
						<Container style={containerStyle}>
							<Row>
								<Col xs="12">
									<ExchangeList settingOpen={this.state.settingOpen} exchangeList={exchangeList}/>
								</Col>
							</Row>
						</Container>
					</div>
				}
			</div>
		)
	}
}

ExchangeListContainer.contextTypes = {
	user: PropTypes.object
};
