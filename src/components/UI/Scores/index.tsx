import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import CSVReader from "react-csv-reader";
import { toast } from "react-toastify";
import { GradeAssignmentModel } from "../../../@types/models/GradeAssignmentModel";
import { StudentGradeModel } from "../../../@types/models/StudentGradeModel";
import { StudentModel } from "../../../@types/models/StudentModel";
import { TeacherModel } from "../../../@types/models/TeacherModel";
import UploadIcon from "../../../components/icons/Upload";
import { useAuth } from "../../../contexts/auth-context";
import useHttp from "../../../hooks/useHttp";
import { calculatePercent } from "../../../utils";
import { groupBy } from "../../../utils/array";
import CheckIcon from "../../icons/Check";
import DownloadIcon from "../../icons/Download";
import Download2Icon from "../../icons/Download2";
import StudentView from "./components/StudentView";

const pathname = window.location.pathname;

const classId = pathname.split("/")[2];

interface FinalScoreInterface {
  studentId: string;
  score: number;
}

const Scores = () => {
  const [listTeachers, setListTeachers] = useState<TeacherModel[]>([]);
  const [assignments, setAssignments] = useState<GradeAssignmentModel[]>([]);
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [gradeStudents, setGradeStudents] = useState<StudentGradeModel[]>([]);
  const [finalScore, setFinalScore] = useState<FinalScoreInterface[]>([]);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [assignmentReturn, setAssignmentReturn] = useState<number>(0);
  const [isUploadScore, setIsUploadScore] = useState<number>(0);

  const authCtx = useAuth();
  const userId = authCtx.user.id;

  const { sendRequest } = useHttp();

  const handleCellEditCommit = (e: any) => {
    if (e.row) {
      const foundStudents = students.filter((s) => s.studentId === e.row.MSSV);
      const foundAssignments = assignments.filter((a) => a.title === e.field);
      const student = foundStudents[0];
      const gradeAssignment = foundAssignments[0];

      if (!student) return;
      if (!gradeAssignment) return;

      const cellExistValue = gradeStudents.some((g) => g.studentId === e.row.MSSV && g.gradeAssignmentId === gradeAssignment.id);

      const handleError = () => {
        setGradeStudents((prev) => [...prev]);
      };

      if (!cellExistValue && !e.value) {
        return;
      }

      if (cellExistValue && !e.value) {
        e.value = 0;
      }

      const newScore = +e.value;

      if (newScore > 10) {
        toast("Điểm không được lớn hơn điểm tối đa", { type: "error" });
        return;
      }

      if (newScore < 0) {
        toast("Điểm không thể là số âm", { type: "error" });
        return;
      }

      const requestConfig = {
        url: `grades/${classId}/${gradeAssignment.id}/${student.studentId}`,
        method: "PATCH",
        body: {
          score: newScore,
        },
      };

      const handleSuccess = (data: any) => {
        const newGrade = data.data as StudentGradeModel;

        if (cellExistValue) {
          setGradeStudents((prev) =>
            prev.map((row) => {
              return row.studentId === newGrade.studentId && row.gradeAssignmentId === newGrade.gradeAssignmentId ? newGrade : row;
            })
          );
        }

        if (!cellExistValue) {
          const newGradeStudents = [...gradeStudents, newGrade];
          setGradeStudents(newGradeStudents);
        }
      };

      sendRequest(requestConfig, handleError, handleSuccess);
    }
  };

  //get teacher
  useEffect(() => {
    const requestConfig = {
      url: "classes/" + classId + "/teachers",
    };
    const handleError = () => {};

    const getTeachers = (data: any) => {
      const memberInfoFormat: TeacherModel[] = data.data.teachers.map((member: any) => {
        return {
          id: member.profile.id,
        };
      });
      setListTeachers(memberInfoFormat);
    };
    sendRequest(requestConfig, handleError, getTeachers);
  }, [sendRequest]);

  //check teacher
  useEffect(() => {
    if (listTeachers.findIndex((teacher) => teacher.id === userId) >= 0) {
      setIsTeacher(true);
    }
  }, [listTeachers, userId]);

  // Students
  useEffect(() => {
    const requestConfig = {
      url: `students/getStudentsByClassId/${classId}`,
    };

    const handleError = () => {};

    const handleSuccess = (data: any) => {
      setStudents(data);
    };

    sendRequest(requestConfig, handleError, handleSuccess);
  }, [sendRequest]);

  // Class assignments
  useEffect(() => {
    const requestConfig = {
      url: `classes/${classId}/gradeStructures`,
    };

    const handleError = () => {};

    const handleSuccess = (data: any) => {
      const gradeAssignmentsData: GradeAssignmentModel[] = data.data.gradeStructure.gradeAssignments.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          pos: item.pos,
          score: item.score,
        };
      });

      setAssignments(gradeAssignmentsData);
    };

    sendRequest(requestConfig, handleError, handleSuccess);
  }, [sendRequest]);

  // Class grades
  useEffect(() => {
    const requestConfig = {
      url: `grades/${classId}`,
    };

    const handleError = () => {};

    const handleSuccess = (data: any) => {
      setGradeStudents(data.data.grades);
    };

    sendRequest(requestConfig, handleError, handleSuccess);
  }, [sendRequest, students, isUploadScore]);

  // Calculate Final Score
  useEffect(() => {
    const groupedStudentGrades = groupBy(gradeStudents, (item) => item.studentId);
    let totalScore = 0;

    for (let i of assignments) {
      totalScore += +i.score;
    }

    const rows = students.map((student, index) => {
      let finalScore = 0;

      if (groupedStudentGrades[student.studentId]) {
        for (let i of groupedStudentGrades[student.studentId]) {
          const assignmentIndex = assignments.findIndex((a) => a.id === i.gradeAssignmentId);
          if (assignments) {
            if (assignments[assignmentIndex]) {
              if (!Number.isNaN(assignments[assignmentIndex].score * i.score)) {
                finalScore += assignments[assignmentIndex].score * i.score;
              }
            }
          }
        }
      }

      return { studentId: student.studentId, score: calculatePercent(finalScore / totalScore) };
    });

    setFinalScore(rows);
  }, [gradeStudents, students, assignments]);

  const renderRows = (students: StudentModel[], studentGrades: StudentGradeModel[]) => {
    const groupedStudentGrades = groupBy(studentGrades, (item) => item.studentId);

    const rows = students.map((student, index) => {
      const grades = groupedStudentGrades[student.studentId];

      const base = { id: index, "Tên sinh viên": student.fullName, MSSV: student.studentId };

      if (grades) {
        const assignmentIdWithScores = grades.reduce(
          (prev, curr) => ({ ...prev, [assignments[assignments.findIndex((a) => a.id === curr.gradeAssignmentId)]?.title]: curr.score }),
          {}
        );

        if (finalScore) {
          const scoreIndex = finalScore.findIndex((s) => s.studentId === student.studentId);

          const summary = { "Tổng kết": Number.isNaN(finalScore[scoreIndex].score) ? 0 : finalScore[scoreIndex].score };

          return { ...base, ...assignmentIdWithScores, ...summary };
        }
        return { ...base, ...assignmentIdWithScores };
      }

      return base;
    });

    return rows;
  };

  const dataGridRows = renderRows(students, gradeStudents);

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  };

  const handleForce = (data: any) => {
    if (data[0]["Tên sinh viên"]) {
      const dataAssignmentStudentsArr = data.map((student: any) => {
        return assignments.map((assignment) => {
          // console.log(student, assignment.title);

          return {
            studentId: student["MSSV"].toString(),
            score: getValueByKey(student, assignment.title),
            gradeAssignmentId: assignment.title === getKey(student, assignment.title) ? assignment.id : -1,
          };
        });
      });

      const dataAssignmentStudents = [];

      for (let i of dataAssignmentStudentsArr) {
        for (let j of i) {
          dataAssignmentStudents.push(j);
        }
      }

      const requestConfig = {
        url: `grades/${classId}`,
        method: "POST",
        body: { grades: dataAssignmentStudents },
      };
      const handleError = () => {
        toast("Cập nhật điểm thất bại");
      };

      const uploadStudents = (data: any) => {
        setIsUploadScore((curr) => curr + 1);
        toast("Cập nhật điểm thành công");
      };

      sendRequest(requestConfig, handleError, uploadStudents);
    } else {
      console.log("Wrong header");
    }
  };

  const handleForceAssignment = (data: any, grade: GradeAssignmentModel) => {
    if (data[0]["Tên sinh viên"]) {
      const dataAssignmentStudents = data.map((student: any) => {
        return {
          studentId: student["MSSV"].toString(),
          score: student[grade.title],
        };
      });

      const requestConfig = {
        url: `grades/${classId}/${grade.id}`,
        method: "POST",
        body: { grades: dataAssignmentStudents },
      };
      const handleError = () => {
        toast("Cập nhật điểm thất bại");
      };
      const uploadStudents = (data: any) => {
        setIsUploadScore((curr) => curr + 1);
        console.log("asgasdg");
        toast("Cập nhật điểm thành công");
      };
      sendRequest(requestConfig, handleError, uploadStudents);
    } else {
      console.log("Wrong header");
    }
  };

  const assignment_columns: GridColDef[] = assignments.map((grade) => {
    const assignment_name = grade.title;

    const template_score = [{ studentName: "Nguyễn Văn A", studentId: "1", [grade.title]: "1" }];

    const groupedStudentGrades = groupBy(gradeStudents, (item) => item.studentId);

    const assignment_score = dataGridRows.map((student) => {
      const grades = groupedStudentGrades[student.MSSV];
      return {
        studentName: student["Tên sinh viên"],
        studentId: student.MSSV,
        [assignment_name]: grades ?? "",
      };
    });

    const returnScore = () => {
      const requestConfig = {
        url: `students/markFinalizedGrade/${assignmentReturn}`,
      };

      const handleError = () => {
        toast("Trả điểm thất bại");
      };

      const uploadStudents = (data: any) => {
        toast("Trả điểm thành công");
      };

      sendRequest(requestConfig, handleError, uploadStudents);
    };

    const scores_headers = [
      { label: "Tên sinh viên", key: "studentName" },
      { label: "MSSV", key: "studentId" },
      { label: assignment_name, key: assignment_name },
    ];

    return {
      field: grade.title,
      width: 250,
      sortable: false,
      editable: true,
      renderHeader: (headerParams: any) => {
        const formatGradeAssignmentName = grade.title.length <= 10 ? grade.title : grade.title.substring(0, 9);
        const headerName = `${formatGradeAssignmentName} (${grade.score})`;

        return (
          <>
            {headerName}
            <div className="scores__render-headers">
              <CSVLink data={template_score} filename={`${grade.title}.csv`} headers={scores_headers}>
                <Download2Icon className="icon--csv ml1" />
              </CSVLink>

              <CSVLink data={assignment_score} filename={`${grade.title}.csv`} headers={scores_headers}>
                <DownloadIcon className="icon--csv ml1" />
              </CSVLink>

              <CSVReader
                cssClass="csv-reader-input"
                label={<UploadIcon className="icon--csv ml1" />}
                onFileLoaded={(data) => handleForceAssignment(data, grade)}
                parserOptions={papaparseOptions}
                inputId={"assignment" + grade.id}
                inputName={"assignment" + grade.id}
              />
              <CheckIcon
                className="icon--csv ml1"
                onClick={() => {
                  setAssignmentReturn(grade.id);
                  returnScore();
                }}
              />
            </div>
          </>
        );
      },
    };
  });

  const grades_headers_assignment = assignments.map((grades) => {
    return {
      label: grades.title,
      key: grades.title,
    };
  });

  const scores_headers = [
    { label: "Tên sinh viên", key: "studentName" },
    { label: "MSSV", key: "studentId" },
  ].concat(grades_headers_assignment);

  const grades_columns = assignments.map((grades) => {
    return {
      [grades.title]: "1",
    };
  });

  let grades_columns_template = {};

  for (let i of grades_columns) {
    grades_columns_template = { ...grades_columns_template, ...i };
  }

  grades_columns_template = {
    ...{
      studentName: "Nguyễn Văn A",
      studentId: "1",
    },
    ...grades_columns_template,
  };

  const grades_board_data = dataGridRows.map((student) => {
    return {
      studentName: student["Tên sinh viên"],
      studentId: student.MSSV,
      ...student,
    };
  });

  const columns: GridColDef[] = [
    {
      field: "Tên sinh viên",
      width: 250,
      editable: false,
      renderHeader: (headerParams: any) => {
        return <>{headerParams.field}</>;
      },
    },
    {
      field: "MSSV",
      width: 120,
      editable: false,
      renderHeader: (headerParams: any) => {
        return <>{headerParams.field}</>;
      },
    },
    ...assignment_columns,
    {
      field: "Tổng kết",
      width: 200,
      editable: false,
      renderHeader: () => {
        return <>{"Tổng kết"}</>;
      },
    },
  ];

  return (
    <>
      {isTeacher ? (
        <div className="scores">
          <div className="scores__header">
            <h1>Quản lý điểm số</h1>

            <div className="scores__actions">
              <button className="scores__button btn btn--primary">
                <CSVLink data={[grades_columns_template]} filename={"template-grades.csv"} headers={scores_headers}>
                  <span>Tải template</span>
                  <Download2Icon className="icon--white" />
                </CSVLink>
              </button>

              <button className="scores__button btn btn--primary">
                <CSVLink data={grades_board_data} filename={"class-grades.csv"} headers={scores_headers}>
                  <span>Tải bảng điểm</span>
                  <DownloadIcon className="icon--white" />
                </CSVLink>
              </button>

              <CSVReader
                cssClass="csv-reader-input"
                label={
                  <div className="scores__button btn btn--primary">
                    <span>Cập nhật bảng điểm</span>
                    <UploadIcon className="icon--white" />
                  </div>
                }
                onFileLoaded={handleForce}
                parserOptions={papaparseOptions}
                inputId="gradesBoard"
                inputName="gradesBoard"
              />
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
              rows={dataGridRows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </div>
        </div>
      ) : (
        <StudentView studentId={authCtx.user.studentId!} assignments={assignments} finalScore={finalScore} />
      )}
    </>
  );
};

export default Scores;

function getValueByKey(object: object, key1: string) {
  for (const [key, value] of Object.entries(object)) {
    if (key === key1) return value;
  }
  return -1;
}

function getKey(object: object, key1: string) {
  for (const [key] of Object.entries(object)) {
    if (key === key1) return key;
  }
  return -1;
}
