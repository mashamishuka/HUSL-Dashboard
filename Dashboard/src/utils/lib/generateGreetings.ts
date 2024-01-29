import moment from 'moment'

export const generateGreetings = () => {
  const currentHour = moment().hour()

  if (currentHour >= 3 && currentHour < 12) {
    return 'Good Morning'
  } else if (currentHour >= 12 && currentHour < 15) {
    return 'Good Afternoon'
  } else if (currentHour >= 15 && currentHour < 20) {
    return 'Good Evening'
  } else if (currentHour >= 20 && currentHour < 23) {
    return 'Good Night'
  } else {
    return 'Hello'
  }
}
