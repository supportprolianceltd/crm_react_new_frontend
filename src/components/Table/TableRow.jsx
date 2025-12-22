import "./styles.css";

export default function TableRow({ employee }) {
  return (
    <tr className="table-row">
      <td>{employee.id}</td>
      <td className="user-cell">
        <img src={employee.profilePicture} alt="avatar" className="avatar" />
        {employee.name}
      </td>
      <td>
        {employee.email}
        <br />
        {employee.phone}
      </td>
      <td>{employee.hours}</td>
      <td>{employee.role}</td>
      <td>
        <span className="status active">Active</span>
      </td>
      <td>Passed</td>
      <td>
        <span className="actions">...</span>
      </td>
    </tr>
  );
}
