import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import React, { useState } from 'react';
export function VisynLoginForm({ onLogin }) {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
    });
    return (React.createElement("form", { onSubmit: form.onSubmit((values) => onLogin(values.username, values.password)) },
        React.createElement(Stack, null,
            React.createElement(TextInput, { placeholder: "Username", label: "Username", name: "username", autoComplete: "username", ...form.getInputProps('username'), required: true }),
            React.createElement(TextInput, { type: isShowPassword ? 'text' : 'password', placeholder: "Password", label: "Password", name: "password", autoComplete: "current-password", ...form.getInputProps('password'), rightSection: React.createElement(ActionIcon, { onClick: () => setIsShowPassword(!isShowPassword) }, isShowPassword ? React.createElement(FontAwesomeIcon, { icon: faEye }) : React.createElement(FontAwesomeIcon, { icon: faEyeSlash })), required: true })),
        React.createElement(Group, { position: "right" },
            React.createElement(Button, { fullWidth: false, mt: "md", type: "submit", className: "btn btn-primary" }, "Login"))));
}
//# sourceMappingURL=VisynLoginForm.js.map