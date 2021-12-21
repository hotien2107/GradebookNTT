import { DataGrid, GridColumns, GridEnrichedColDef, GridEventListener, GridEvents, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { GradeAssignmentModel } from "../../../@types/models/GradeAssignmentModel";
import Container from "../../../components/layouts/container/Container";
import * as mock from "./mock";
import "./index.scss";
import useHttp from "../../../hooks/useHttp";
import UploadIcon from "../../../components/icons/Upload";
import Button from "../../../components/UI/button/Button";
import { makeStyles, withStyles } from "@mui/material";
import { StudentModel } from "../../../@types/models/StudentModel";
import { StudentGradeModel } from "../../../@types/models/StudentGradeModel";

const rows = [
  { id: 1, studentId: "1232", "1": 2, "2": 1 },
  { id: 2, studentId: "123", "1": 2, "2": 1 },
  { id: 3, studentId: "143", "1": 1, "2": 0.5 },
  { id: 4, studentId: "090", "1": 1.25, "2": 0.25 },
  { id: 5, studentId: "456", "1": 1, "2": 1 },
];

const columnsDefinition = (assignments: GradeAssignmentModel[]) => {
  const gridCols: GridEnrichedColDef[] = assignments.map((assignment) => ({
    field: assignment.id.toString(),
    headerName: assignment.title,
    width: 200,
    editable: true,
    align: "left",
    renderCell: (params) => {
      return <div>{params.value}</div>;
    },
    // TODO: render cell with button menu
    // renderEditCell: (params) => {
    //   return <input value={params.value?.toString()} />;
    // },
  }));

  gridCols.unshift({
    field: "studentId",
    headerName: "Sinh Vien",
    width: 200,
    editable: true,
    align: "left",
  });

  return gridCols;
};

const renderRows = (students: StudentModel[], assignments: GradeAssignmentModel[], studentGrades: StudentGradeModel[]) => {
  students.map((student) => {
    const base = { id: student.id, studentName: student.fullName };
    const scores = assignments.map((assignment) => {
      const studentGrade = studentGrades.find((grade) => grade.gradeAssignmentId == assignment.id);
      const score = studentGrade == undefined ? null : studentGrade.score;
      return { [assignment.id]: score };
    });
    return { ...base, ...scores };
  });
};

const handleCellEditCommit: GridEventListener<GridEvents.cellEditCommit> = (e) => {
  console.log(e);
};

const Scores = () => {
  const [assignments, setAssignments] = useState<GradeAssignmentModel[]>([]);
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [gradeStudents, setGradeStudents] = useState<StudentGradeModel[]>([]);

  useEffect(() => {
    // TODO: fetch
    setAssignments(mock.assignments);
  }, []);

  useEffect(() => {
    // TODO: fetch students
  }, []);

  useEffect(() => {
    // TODO: fetch grades
  }, []);

  const dataGridCols = columnsDefinition(assignments);
  const dataGridRows = renderRows(students, assignments, gradeStudents);

  return (
    <Container>
      <div className="scores">
        <div className="scores__header">
          <h1>Quản lý điểm số</h1>

          <div className="scores__actions">
            <button className="scores__action">
              <UploadIcon />
            </button>
            <button className="scores__action">
              <UploadIcon />
            </button>
          </div>
        </div>

        <div className="scores__datagrid">
          <DataGrid
            onCellEditCommit={handleCellEditCommit}
            sx={{
              fontSize: "2rem",
              "& .MuiDataGrid-editInputCell": {
                fontSize: "2rem",
              },
              ".MuiDataGrid-cell": {
                border: "1px solid gray",
                borderLeft: 0,
                borderTop: 0,
              },
            }}
            autoHeight={true}
            rows={rows}
            columns={dataGridCols}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </div>
      </div>
    </Container>
  );
};

export default Scores;
