import React from "react";
import { render } from "react-dom";
import moment from "moment";
import _ from "lodash";
import { timeToMoment } from "./helpers";

const rangeBetween = (start, end) => {
  const dates = [];
  let prevDate = moment(start);

  while (prevDate.isBefore(moment(end))) {
    dates.push(prevDate.format());
    prevDate = moment(prevDate.add("1", "hours"));
  }

  return dates;
};

const startPointRange = ({ from, until }) => {
  const dates = [];
  let prevDate = moment(from);

  while (prevDate.isSameOrBefore(moment(until))) {
    dates.push(prevDate.format());
    prevDate = moment(prevDate.add("1", "hours"));
  }

  console.log("STARTING RANGE......", dates, "frommmmm", prevDate);

  return dates;
};

const endPointRange = (from, until) => {
  const dates = [];
  //const until = moment();
  let prevDate = moment(from);

  while (prevDate.isSameOrBefore(moment(until))) {
    dates.push(prevDate.format());
    prevDate = moment(prevDate.add("1", "hours"));
  }

  console.log("ENDING RANGE......", dates);

  return dates;
};

const rangeAfter = (start, end) => {
  const dates = [];
  let prevDate = moment(start).add(1, "hours");

  while (prevDate.isSameOrBefore(moment(end))) {
    dates.push(prevDate.format());
    prevDate = moment(prevDate.add("1", "hours"));
  }

  return dates;
};

function getAvailableHours({ openingHours, appointments }) {
  const availableHours = appointments.reduce(
    (result, appointment, i) => {
      // First iteration
      if (i === 0) {
        // If first appointment does NOT starts at the beginning of the day
        if (openingHours.from !== appointment.from) {
          result.availableHours.push(
            {
              from: openingHours.from,
              until: appointment.from
            },
            {
              from: appointment.until,
              until: openingHours.until
            }
          );
        }

        if (openingHours.from === appointment.from) {
          result.availableHours.push({
            from: appointment.until,
            until: openingHours.until
          });
        }

        result.previousAppointment = appointment;
        return result;
      }

      if (
        moment(appointment.from).isSameOrAfter(result.previousAppointment.until)
      ) {
        let index;
        const resultFilter = result.availableHours.map((hour, i) => {
          if (moment(appointment.from).isBefore(hour.until)) {
            index = i;
          }
        });

        delete result.availableHours[index];
      }

      // If previous appointment is ended before current appointment started
      // we have available hours between.
      if (moment(result.previousAppointment.until).isBefore(appointment.from)) {
        result.availableHours.push({
          from: result.previousAppointment.until,
          until: appointment.from
        });
      }

      // If we have no more appointments in the future
      if (appointments.length - 1 === i) {
        // If last appointment is ended before day ends, add available hours
        if (!moment(appointment.until).isSame(openingHours.until)) {
          result.availableHours.push({
            from: appointment.until,
            until: openingHours.until
          });
        }
      }
      result.previousAppointment = appointment;

      return result;
    },
    { previousAppointment: null, availableHours: [] }
  );

  return availableHours.availableHours;
}

// const availableHours = getAvailableHours({
//   openingHours: { from: timeToMoment("09:00"), until: timeToMoment("14:00") },
//   appointments: [
//     //  { from: timeToMoment("09:00"), until: timeToMoment("10:00") },
//     // { from: timeToMoment("10:00"), until: timeToMoment("11:00") },
//     //  { from: timeToMoment("11:00"), until: timeToMoment("12:00") }
//   ]
// });

class Hours extends React.Component {
  state = {
    start: "",
    end: "",
    availableDates: [],
    appointments: []
  };

  componentWillMount() {
    const { openingHours } = this.props;
    const startDates = startPointRange(openingHours);

    console.log("START DATEEEEEEEEEE", startDates[0]);

    this.setState({ availableDates: startDates });
    const startDate = moment(startDates[0]).format("YYYY-MM-DD HH:mm");
    const endDate = moment(startDate, "YYYY-MM-DD HH:mm")
      .add(1, "hour")
      .format("YYYY-MM-DD HH:mm");

    this.setState({
      start: startDate,
      end: endDate
    });
  }

  onSelectChange = ({ target: { value, name } }) => {
    if (name === "start") {
      console.log("ON__SELECT_CHANGE_StART", value);
      const endDate = moment(value)
        .add(1, "hours")
        .utcOffset(2, true)
        .format("YYYY-MM-DD HH:mm");

      this.setState({ start: value, end: endDate });
    } else {
      this.setState({ [name]: value });
    }

    // const moment = Moment(this.state.start);
  };

  handleAddAppointment = () => {
    // console.log("CLICKED____");

    this.props.addAppointment();
  };

  getEndDates = () => {
    const { appointments } = this.props;
    const { openingHours: { until } } = this.props;

    console.log("END___DATES", this.state);
    const startDay = moment(this.state.start)
      .add(1, "hour")
      .format("YYYY-MM-DD / HH:mm");
    const startHour = moment(this.state.start)
      .add(1, "hour")
      .format("HH:mm");

    const endDates = endPointRange(startDay, until);
    return endDates;
  };

  getDates = () => {
    const { appointments, openingHours } = this.props;
    const { start, end } = this.state;
    const startDay = moment(start).format("YYYY-MM-DD");

    const startTime = "09:00";
    const endTime = "23:00";
    if (!appointments.length) {
      return this.state.availableDates;
    }

    const availabel = getAvailableHours({ openingHours, appointments });

    console.log("skjksdbfknsdbfknsdf", availabel);

    return this.state.availableDates;
    // return t
  };

  render() {
    const availabelDats = this.getDates();
    return (
      <div>
        <h1>Start Hour:</h1>
        <select
          name="start"
          value={this.state.start}
          onChange={this.onSelectChange}
        >
          {availabelDats
            ? availabelDats.map(hour => (
                <option key={hour}>
                  {" "}
                  {moment(hour).format("YYYY-MM-DD / HH:mm")}
                </option>
              ))
            : null}
        </select>
        <select
          name="end"
          value={this.state.end}
          onChange={this.onSelectChange}
        >
          {this.getEndDates().map(hour => (
            <option key={hour}>
              {moment(hour).format("YYYY-MM-DD / HH:mm")}
            </option>
          ))}
        </select>
        <button onClick={this.handleAddAppointment}>Add Appointment</button>
      </div>
    );
  }
}

class App extends React.Component {
  state = {
    selected: null,
    start: null,
    end: null,
    availableHours: [],
    openingHours: {
      from: timeToMoment("08:00"),
      until: timeToMoment("20:00")
    },
    appointments: [
      // manual check: here check
      // 11:00 - 12:00 free
      // 12:00 - 15:00 free :D damnnnnnnnnnnnnnnnnnn
      { from: timeToMoment("08:00"), until: timeToMoment("10:00") }
      // { from: timeToMoment("10:00"), until: timeToMoment("11:00") },
      // { from: timeToMoment("13:00"), until: timeToMoment("16:00") }
      //  { from: timeToMoment("16:00"), until: timeToMoment("18:00") }
    ]
  };

  addAppointment = () => {
    const addAppointment = {
      from: timeToMoment("16:00"),
      until: timeToMoment("18:00")
    };

    // console.log('HOOOLAAAAA____')
    this.setState({
      appointments: [...this.state.appointments, addAppointment]
    });
  };

  render() {
    const { appointments, openingHours, selected } = this.state;
    const sortedAppointments = _.sortBy(appointments, appointment => {
      return moment(appointment.until);
    });

    const getAvailable = getAvailableHours({
      openingHours,
      appointments: sortedAppointments
    });

    const availableHours = getAvailable.filter(hour => hour !== null);

    console.log(
      "AVALABELLLL_________",
      getAvailable.filter(hour => hour !== null)
    );

    const startPoint = startPointRange(openingHours);

    return (
      <div>
        <Hours
          openingHours={this.state.openingHours}
          appointments={this.state.appointments}
          addAppointment={this.addAppointment}
        />

        <h2>Available Hours</h2>
        <div style={{ width: "450px" }}>{JSON.stringify(availableHours)}</div>

        {/*availableHours.map(availableHour => (
          <h4>
            {moment(availableHour.from).format("YYYY-MM-DD / HH:mm")}{" "}
            {moment(availableHour.until).format("YYYY-MM-DD / HH:mm")}{" "}
          </h4>
        ))*/}
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
